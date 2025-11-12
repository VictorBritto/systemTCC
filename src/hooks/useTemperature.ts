import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseData } from '../routes/supabasedata';
import { config } from '../config';

const LAST_NOTIFICATION_KEY = 'last_temperature_notification';
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutos em milissegundos

// Função para verificar e enviar notificação se necessário
const checkAndNotify = async (temperatura: number) => {
  const { lowerThreshold, upperThreshold } = config.temperature;

  try {
    const lastNotification = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
    let shouldNotify = true;

    if (lastNotification) {
      const { temp, time, notificationType } = JSON.parse(lastNotification);
      const timeSinceLastNotification = Date.now() - time;

      // Verificar se já foi notificado recentemente
      if (timeSinceLastNotification < NOTIFICATION_COOLDOWN) {
        if (temperatura < lowerThreshold && notificationType === 'low') {
          shouldNotify = false;
        } else if (temperatura > upperThreshold && notificationType === 'high') {
          shouldNotify = false;
        }
      }
    }

    if (shouldNotify) {
      if (temperatura < lowerThreshold) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🌡️ Alerta de Temperatura Baixa',
            body: `A temperatura atual é de ${temperatura.toFixed(1)}°C, abaixo do limite mínimo de ${lowerThreshold}°C!`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { temperature: temperatura, type: 'low' },
          },
          trigger: null,
        });
        await AsyncStorage.setItem(
          LAST_NOTIFICATION_KEY,
          JSON.stringify({
            temp: temperatura,
            time: Date.now(),
            notificationType: 'low',
          })
        );
      } else if (temperatura > upperThreshold) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔥 Alerta de Temperatura Alta',
            body: `A temperatura atual é de ${temperatura.toFixed(1)}°C, acima do limite máximo de ${upperThreshold}°C!`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { temperature: temperatura, type: 'high' },
          },
          trigger: null,
        });
        await AsyncStorage.setItem(
          LAST_NOTIFICATION_KEY,
          JSON.stringify({
            temp: temperatura,
            time: Date.now(),
            notificationType: 'high',
          })
        );
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/enviar notificação:', error);
  }
};

export const useTemperature = () => {
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemperatura = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando temperatura do Supabase...');
      const { data, error } = await supabaseData
        .from('leituras_sensores')
        .select('id, temperatura, umidade, presenca_fumaca')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro na consulta:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Dados encontrados:', data[0]);
        const newTemp = data[0].temperatura;
        setTemperatura(newTemp);
        // Verificar e notificar se necessário
        await checkAndNotify(newTemp);
      } else {
        console.log('Nenhum dado encontrado');
        setTemperatura(null);
      }
    } catch (error: any) {
      console.error('Error fetching temperature:', error);
      const errorMessage = error?.message || error?.details || 'Falha ao buscar temperatura';
      console.error('Mensagem de erro completa:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatura();

    // Set up real-time subscription
    console.log('Configurando subscription em tempo real...');
    const subscription = supabaseData
      .channel('leituras_sensores_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leituras_sensores',
        },
        async (payload) => {
          console.log('Nova leitura recebida:', payload.new);
          const newTemp = payload.new.temperatura;
          setTemperatura(newTemp);
          // Verificar e notificar quando receber nova leitura
          await checkAndNotify(newTemp);
        }
      )
      .subscribe((status) => {
        console.log('Status da subscription:', status);
      });

    // Fetch updates every 30 seconds as backup
    const interval = setInterval(() => {
      console.log('Atualização de backup...');
      fetchTemperatura();
    }, 30000);

    return () => {
      console.log('Limpando subscription e interval...');
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { temperatura, loading, error, refetch: fetchTemperatura };
};
