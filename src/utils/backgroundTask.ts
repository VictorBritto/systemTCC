// backgroundTask.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseData } from '../routes/supabaseData.js';
import { config } from '../config';

const TASK_NAME = 'background-fetch-task';
const LAST_NOTIFICATION_KEY = 'last_temperature_notification';
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutos em milissegundos

// Verificar se já foi enviada notificação recentemente para evitar spam
const shouldSendNotification = async (
  temperature: number,
  threshold: number,
  type: 'high' | 'low'
): Promise<boolean> => {
  try {
    const lastNotification = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
    if (lastNotification) {
      const { temp, time, notificationType } = JSON.parse(lastNotification);
      const timeSinceLastNotification = Date.now() - time;

      // Se passou menos que o cooldown e a temperatura ainda está no mesmo estado crítico
      if (
        timeSinceLastNotification < NOTIFICATION_COOLDOWN &&
        notificationType === type &&
        ((type === 'high' && temperature >= threshold) ||
          (type === 'low' && temperature <= threshold))
      ) {
        return false; // Não enviar notificação duplicada
      }
    }

    // Salvar informação da notificação
    await AsyncStorage.setItem(
      LAST_NOTIFICATION_KEY,
      JSON.stringify({
        temp: temperature,
        time: Date.now(),
        notificationType: type,
      })
    );

    return true;
  } catch (error) {
    console.error('Erro ao verificar última notificação:', error);
    return true; // Em caso de erro, permitir notificação
  }
};

const checkTemperatureAndNotify = async (temperatura: number, smokeValue?: number | null) => {
  const { lowerThreshold, upperThreshold } = config.temperature;

  if (temperatura < lowerThreshold) {
    const canNotify = await shouldSendNotification(temperatura, lowerThreshold, 'low');
    if (canNotify) {
      const smokePart =
        smokeValue !== null && smokeValue !== undefined ? ` Fumaça: ${smokeValue} ppm.` : '';
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌡️ Alerta de Temperatura Baixa',
          body: `A temperatura atual é de ${temperatura.toFixed(1)}°C, abaixo do limite mínimo de ${lowerThreshold}°C!${smokePart}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { temperature: temperatura, type: 'low', smokeValue },
        },
        trigger: null,
      });
    }
  } else if (temperatura > upperThreshold) {
    const canNotify = await shouldSendNotification(temperatura, upperThreshold, 'high');
    if (canNotify) {
      const smokePart =
        smokeValue !== null && smokeValue !== undefined ? ` Fumaça: ${smokeValue} ppm.` : '';
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Alerta de Temperatura Alta',
          body: `A temperatura atual é de ${temperatura.toFixed(1)}°C, acima do limite máximo de ${upperThreshold}°C!${smokePart}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { temperature: temperatura, type: 'high', smokeValue },
        },
        trigger: null,
      });
    }
  }
};

const LAST_SMOKE_NOTIFICATION_KEY = 'last_smoke_notification_bg';

const checkSmokeAndNotify = async (smokeValue: number, temperature: number | null) => {
  try {
    const threshold = config.smoke?.threshold ?? 100;
    if (smokeValue >= threshold) {
      // verificar cooldown para fumaça
      try {
        const last = await AsyncStorage.getItem(LAST_SMOKE_NOTIFICATION_KEY);
        const lastTs = last ? Number(last) : 0;
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 1000; // 5 minutos
        if (now - lastTs > COOLDOWN) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Fumaça detectada!',
              body: `Foi detectado ${smokeValue} ppm de fumaça.${
                temperature !== null && temperature !== undefined
                  ? ` Temperatura atual: ${temperature.toFixed(1)}°C.`
                  : ''
              }`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: { smokeValue, temperature, type: 'smoke' },
            },
            trigger: null,
          });
          await AsyncStorage.setItem(LAST_SMOKE_NOTIFICATION_KEY, String(now));
          console.log('[BackgroundFetch] Notificação de fumaça enviada', {
            smokeValue,
            temperature,
          });
        } else {
          console.log('[BackgroundFetch] Notificação de fumaça ignorada (cooldown)');
        }
      } catch (err) {
        console.error('Erro ao gerenciar cooldown de notificação de fumaça:', err);
      }
    }
  } catch (err) {
    console.error('Erro ao checar fumaça em background:', err);
  }
};

TaskManager.defineTask(TASK_NAME, async () => {
  console.log('[BackgroundFetch] Executando tarefa em background...');
  try {
    // Buscar leitura mais recente (temperatura + fumaça)
    const { data, error } = await supabaseData
      .from('leituras_sensores')
      .select('temperatura, presenca_fumaca')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao buscar temperatura em background:', error);
      throw error;
    }

    if (data && data.length > 0) {
      const latest = data[0];
      // Checar temperatura + fumaça
      const smokeVal = Number(latest.presenca_fumaca ?? NaN);
      if (typeof latest.temperatura === 'number') {
        await checkTemperatureAndNotify(latest.temperatura, !isNaN(smokeVal) ? smokeVal : null);
      }

      // Checar fumaça separadamente (caso deseje notificação específica de fumaça)
      if (!isNaN(smokeVal)) {
        await checkSmokeAndNotify(smokeVal, latest.temperatura ?? null);
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error('Erro na tarefa em segundo plano:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    // Verificar se a tarefa já está registrada
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: config.backgroundTasks.minimumInterval,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('Tarefa em background registrada com sucesso');
    } else {
      console.log('Tarefa em background já está registrada');
    }
  } catch (err: any) {
    console.error('Erro ao registrar tarefa em background:', err);
    // Em desenvolvimento, pode não funcionar, mas não deve quebrar o app
    if (err.message && err.message.includes('not available')) {
      console.warn('Background fetch não está disponível neste ambiente');
    }
  }
};

export const unregisterBackgroundTask = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
      console.log('Tarefa em background cancelada');
    }
  } catch (err) {
    console.error('Erro ao cancelar tarefa em background:', err);
  }
};

