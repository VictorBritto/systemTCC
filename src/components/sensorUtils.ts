// sensorUtils.ts
import { supabase } from '../routes/supabase';
import * as Notifications from 'expo-notifications';

export const generateRandomTemperature = (): string => {
  return (Math.random() * (30 - 10) + 10).toFixed(2);
};

export const sendNotification = async (temp: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Alerta de Temperatura',
      body: `A temperatura atual é de ${temp}°C, abaixo do limite de segurança!`,
      sound: true,
    },
    trigger: null,
  });
};

export const sendSimulatedData = async () => {
  const temperaturaSimulada = generateRandomTemperature();

  const { error } = await supabase
    .from('leituras_sensores')
    .insert([{ temperatura: temperaturaSimulada, data_hora: new Date() }]);

  if (error) {
    console.error('Erro ao inserir dados no Supabase:', error);
    return null;
  }

  console.log('Leitura simulada enviada');
  return temperaturaSimulada;
};

export const insertMultipleRandomData = async (count: number = 10) => {
  const randomData = [];
  
  for (let i = 0; i < count; i++) {
    const temperatura = parseFloat(generateRandomTemperature());
    const data_hora = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
    
    randomData.push({
      temperatura,
      data_hora: data_hora.toISOString()
    });
  }

  const { error } = await supabase
    .from('leituras_sensores')
    .insert(randomData);

  if (error) {
    console.error('Erro ao inserir múltiplos dados:', error);
    return false;
  }

  console.log(`${count} registros aleatórios inseridos com sucesso`);
  return true;
};

export const fetchTemperatura = async (): Promise<number | null> => {
  const { data, error } = await supabase
    .from('leituras_sensores')
    .select('temperatura')
    .order('data_hora', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Erro ao buscar dados do Supabase:', error);
    return null;
  }

  const temp = data?.temperatura;
  if (temp && temp < 19) {
    await sendNotification(temp);
  }

  return temp;
};
