export interface WeatherData {
  temp: number;
  description: string;
}

export interface SensorReading {
  temperatura: number;
  data_hora: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface NotificationConfig {
  lowerTemperatureThreshold: number;
  upperTemperatureThreshold: number;
  notificationEnabled: boolean;
} 