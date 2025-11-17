import * as Location from 'expo-location';
import { config } from '../config';
import { WeatherData } from '../types';

export const getLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão de localização não concedida. Por favor, permita o acesso à localização nas configurações do dispositivo.');
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  } catch (error: any) {
    console.error('Error getting location:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Erro ao obter localização. Verifique se o GPS está ativado.');
  }
};

export const getWeather = async (): Promise<WeatherData> => {
  try {
    const coords = await getLocation();
    const url = `${config.weather.baseUrl}/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&lang=pt_br&appid=${config.weather.apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Chave da API inválida. Verifique as configurações.');
      } else if (response.status === 429) {
        throw new Error('Muitas requisições. Tente novamente em alguns instantes.');
      } else {
        throw new Error('Erro ao buscar dados do clima. Verifique sua conexão com a internet.');
      }
    }

    const data = await response.json();
    if (!data.main || !data.weather || !data.weather[0]) {
      throw new Error('Dados do clima inválidos recebidos da API.');
    }

    return {
      temp: data.main.temp,
      description: data.weather[0].description,
    };
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Erro ao buscar dados do clima. Tente novamente.');
  }
};
