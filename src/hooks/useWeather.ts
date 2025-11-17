import { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import { getWeather } from '../services/weather';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeather();
      setWeather(data);
      setLastRefresh(new Date());
    } catch (error: any) {
      setError(error?.message || 'Falha ao buscar dados do clima');
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
    lastRefresh,
    refetch: fetchWeather,
  };
}; 