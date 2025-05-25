// backgroundTask.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { supabase } from '../routes/supabase';
import { config } from '../config';

const TASK_NAME = 'background-fetch-task';

const checkTemperatureAndNotify = async (temperatura: number) => {
  const { lowerThreshold, upperThreshold } = config.temperature;
  
  if (temperatura < lowerThreshold) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerta de Temperatura Baixa",
        body: `A temperatura atual é de ${temperatura}°C, abaixo do limite mínimo de ${lowerThreshold}°C!`,
        sound: true,
      },
      trigger: null,
    });
  } else if (temperatura > upperThreshold) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerta de Temperatura Alta",
        body: `A temperatura atual é de ${temperatura}°C, acima do limite máximo de ${upperThreshold}°C!`,
        sound: true,
      },
      trigger: null,
    });
  }
};

TaskManager.defineTask(TASK_NAME, async () => {
  console.log('[BackgroundFetch] Executando tarefa em background...');
  try {
    // Buscar temperatura atual
    const { data, error } = await supabase
      .from('leituras_sensores')
      .select('temperatura')
      .order('data_hora', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (data) {
      await checkTemperatureAndNotify(data.temperatura);
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error('Erro na tarefa em segundo plano:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: config.backgroundTasks.minimumInterval,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Tarefa em background registrada com sucesso');
  } catch (err) {
    console.error('Erro ao registrar tarefa em background:', err);
  }
};
