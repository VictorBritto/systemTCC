import { useState, useEffect } from 'react';
import { supabase } from '../routes/supabase';
import { config } from '../config';
import { SensorReading } from '../types';
import * as Notifications from 'expo-notifications';

export const useTemperature = () => {
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (temp: number) => {
    const { lowerThreshold, upperThreshold } = config.temperature;
    
    if (temp < lowerThreshold) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Alerta de Temperatura Baixa",
            body: `A temperatura atual é de ${temp}°C, abaixo do limite mínimo de ${lowerThreshold}°C!`,
            sound: true,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    } else if (temp > upperThreshold) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Alerta de Temperatura Alta",
            body: `A temperatura atual é de ${temp}°C, acima do limite máximo de ${upperThreshold}°C!`,
            sound: true,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  const fetchTemperatura = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leituras_sensores')
        .select('temperatura, data_hora')
        .order('data_hora', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setTemperatura(data.temperatura);
        await sendNotification(data.temperatura);
      }
    } catch (error) {
      console.error('Error fetching temperature:', error);
      setError('Falha ao buscar temperatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatura();

    // Set up real-time subscription
    const subscription = supabase
      .channel('leituras_sensores')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'leituras_sensores' 
        }, 
        (payload) => {
          const newTemp = payload.new.temperatura;
          setTemperatura(newTemp);
          sendNotification(newTemp);
        }
      )
      .subscribe();

    // Fetch updates every minute as backup
    const interval = setInterval(fetchTemperatura, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { temperatura, loading, error, refetch: fetchTemperatura };
}; 