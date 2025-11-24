import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return true;
};

export const scheduleTemperatureNotification = async (temperature: number, threshold: number) => {
  if (temperature >= threshold) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alerta de Temperatura',
        body: `A temperatura atual é de ${temperature}°C, abaixo do limite de segurança!`,
        data: { temperature, threshold },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const scheduleSmokeNotification = async (temperature: number | null, smokeLevel: number) => {
  try {
    const tempPart =
      temperature !== null && temperature !== undefined ? ` Temperatura: ${temperature}°C.` : '';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Fumaça detectada!',
        body: `O sensor detectou fumaça.${tempPart}`,
        data: { temperature, smokeLevel },
      },
      trigger: null,
    });
    console.log('[notifications] scheduleSmokeNotification: agendada', {
      temperature,
      smokeLevel,
    });
  } catch (error) {
    console.error('Error scheduling smoke notification:', error);
  }
};
