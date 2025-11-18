import Constants from 'expo-constants';

// Configuração mais robusta com fallbacks
const getConfigValue = (key: string, fallback: string) => {
  try {
    return Constants.expoConfig?.extra?.[key] || fallback;
  } catch (error) {
    console.warn(`Erro ao ler configuração ${key}:`, error);
    return fallback;
  }
};

export const config = {
  supabase: {
    url: getConfigValue('SUPABASE_URL', 'https://ejhzykrpxqdtkngmuxqv.supabase.co'),
    anonKey: getConfigValue(
      'SUPABASE_ANON_KEY',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaHp5a3JweHFkdGtuZ211eHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0ODkwNTYsImV4cCI6MjA2MjA2NTA1Nn0.63yUncBc4v2RncYxiQwqGwqK1a8H1x9YX_omcNYlHzA'
    ),
  },
  weather: {
    apiKey: getConfigValue('OPENWEATHER_API_KEY', '5a2cce3324f6fd13dbfd2661740c025b'),
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
  temperature: {
    lowerThreshold: 19,
    upperThreshold: 25,
    checkInterval: 5000,
    simulationEnabled: __DEV__,
  },
  humidity: {
    lowerThreshold: 40,
    upperThreshold: 80,
    checkInterval: 5000,
    simulationEnabled: __DEV__,
  },
  smoke: {
    threshold: 100, // Exemplo: Valor acima do qual fumaça é detectada
    checkInterval: 5000,
    simulationEnabled: __DEV__,
  },
  backgroundTasks: {
    minimumInterval: 15 * 60,
  },
};
