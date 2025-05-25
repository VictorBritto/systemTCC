import * as Location from 'expo-location';
import { config } from '../config';
import { WeatherData } from '../types';

export const getLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

export const getWeather = async (): Promise<WeatherData> => {
  try {
    const coords = await getLocation();
    const url = `${config.weather.baseUrl}/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&lang=pt_br&appid=${config.weather.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    return {
      temp: data.main.temp,
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}; 