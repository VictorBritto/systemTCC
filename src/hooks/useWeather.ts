import { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import { getWeather } from '../services/weather';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeather();
      setWeather(data);
    } catch (error) {
      setError('Falha ao buscar dados do clima');
      console.error('Error in useWeather:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather,
  };
}; 