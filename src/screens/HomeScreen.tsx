import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../routes/supabase';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Alert } from 'react-native/Libraries/Alert/Alert';

export default function App() {
  const [temperatura, setTemperatura] = useState<number | null>(null);

  const generateRandomTemperature = (): string => {
  return (Math.random() * (30 - 10) + 10).toFixed(2);
  };


  const sendSimulatedData = async () => {
    const temperaturaSimulada = generateRandomTemperature();

    try {
      const { data, error } = await supabase
        .from('leituras_sensores')
        .insert([{ temperatura: temperaturaSimulada, data_hora: new Date() }]);
      
      if (error) {
        console.error('Erro ao inserir dados no Supabase:', error);
      } else {
        console.log('Leitura simulada enviada para o Supabase:', data);
      }
    } catch (error) {
      console.error('Erro inesperado ao enviar dados:', error);
    }
  };

  const fetchTemperatura = async () => {
    try {
      const { data, error } = await supabase
        .from('leituras_sensores')
        .select('temperatura')
        .order('data_hora', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do Supabase: ', error);
      } else {
        const temp = data?.temperatura;
        setTemperatura(temp);

        if (temp && temp < 19) {
          sendNotification(temp);
        }
      }
    } catch (error) {
      console.error('Erro inesperado: ', error);
    }
  };

  const sendNotification = (temp: number) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerta de Temperatura",
        body: `A temperatura atual é de ${temp}°C, abaixo do limite de segurança!`,
        sound: true,
      },
      trigger: null,
    });
  };

  useEffect(() => {
    const getPushNotificationToken = async () => {
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Expo Push Token:', token);
      } catch (error) {
        console.error('Erro ao obter o token de notificação push:', error);
      }
    };

    const interval = setInterval(() => {
      fetchTemperatura();
    }, 5000);

    const dataInterval = setInterval(() => {
      sendSimulatedData();
    }, 5000);

    getPushNotificationToken();

    return () => {
      clearInterval(interval);
      clearInterval(dataInterval);
    };
  }, []);

  const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão negada', 'Permita o acesso à localização para continuar');
    return null;
  }

  const location = await Location.getCurrentPositionAsync({});
  return location.coords;
};

const getWeather = async (lat: number, lon: number) => {
  const apiKey = '5a2cce3324f6fd13dbfd2661740c025b';
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();
  return {
    temp: data.main.temp,
    description: data.weather[0].description,
  };
};

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Temperatura Atual</Text>
        <Text style={styles.temperature}>{temperatura ? `${temperatura}°` : 'Carregando...'}</Text>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="thermometer" size={22} color="white" />
          <MaterialCommunityIcons name="snowflake" size={22} color="white" />
          <MaterialCommunityIcons name="weather-snowy" size={22} color="white" />
        </View>
      </View>

      <View style={styles.secondPanel}>
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="cloud" size={24} color="white" />
            <Text style={styles.infoText}>Fumaça</Text>
          </View>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="water" size={24} color="white" />
            <Text style={styles.infoText}>Umidade</Text>
          </View>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="thermometer" size={24} color="white" />
            <Text style={styles.infoText}>Temperatura</Text>
          </View>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="human-greeting" size={24} color="white" />
            <Text style={styles.infoText}>Presença</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.infoRow}>
            <Text style={styles.weatherValue}>22°C</Text>
            <Text style={styles.weatherDescription}>Ar livre</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.weatherValue}>18°C</Text>
            <Text style={styles.weatherDescription}>Atual</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    width: '100%',
    padding: 20,
    backgroundColor: '#121212',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondPanel: {
    width: '100%',
    padding: 50,
    backgroundColor: '#121212',
    borderRadius: 10,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 15,
  },
  temperature: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 40,
  },
  infoBox: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    backgroundColor: '#444444',
    borderRadius: 16,
  },
  infoText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 13,
    textAlign: 'center',
  },
  infoRow: {
    flex: 1,
    alignItems: 'center',
  },
  weatherValue: {
    color: '#fff',
    fontSize: 24,
  },
  weatherDescription: {
    color: '#bbb',
  },
});
