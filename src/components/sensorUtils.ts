// sensorUtils.ts
import { supabaseData } from '../routes/supabasedata';
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

  const { error } = await supabaseData
    .from('leituras_sensores')
    .insert([{ temperatura: temperaturaSimulada }]);

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

    randomData.push({
      temperatura,
    });
  }

  const { error } = await supabaseData.from('leituras_sensores').insert(randomData);

  if (error) {
    console.error('Erro ao inserir múltiplos dados:', error);
    return false;
  }

  console.log(`${count} registros aleatórios inseridos com sucesso`);
  return true;
};

export const fetchTemperatura = async (): Promise<number | null> => {
  const { data, error } = await supabaseData
    .from('leituras_sensores')
    .select('temperatura')
    .order('id', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Erro ao buscar dados do Supabase:', error);
    console.error('Detalhes:', JSON.stringify(error, null, 2));
    return null;
  }

  const temp = data && data.length > 0 ? data[0].temperatura : null;
  if (temp && temp < 19) {
    await sendNotification(temp);
  }

  return temp;
};
