export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '5a2cce3324f6fd13dbfd2661740c025b',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
  temperature: {
    lowerThreshold: 19,
    upperThreshold: 25,
    checkInterval: 5000,
    simulationEnabled: __DEV__,
  },
  backgroundTasks: {
    minimumInterval: 15 * 60, // 15 minutes in seconds
  },
}; 