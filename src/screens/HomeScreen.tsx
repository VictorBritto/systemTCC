import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, RefreshControl, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTemperature } from '../hooks/useTemperature';
import { useWeather } from '../hooks/useWeather';
import { supabaseData } from '../routes/supabaseData.js';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { temperatura, loading: tempLoading, error: tempError, refetch: refetchTemp } = useTemperature();
  const { weather, loading: weatherLoading, error: weatherError, lastRefresh, refetch: refetchWeather } = useWeather();
  const [refreshing, setRefreshing] = useState(false);
  const [sensorData, setSensorData] = useState<any>(null);
  const [previousSmokePresence, setPreviousSmokePresence] = useState<boolean | null>(null);
  const [previousSensorData, setPreviousSensorData] = useState<any>(null);

  const fetchSensorData = async () => {
    try {
      const { data, error } = await supabaseData
        .from('leituras_sensores')
        .select('id, temperatura, umidade, presenca_fumaca')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao buscar dados do sensor:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        return;
      }

      if (data && data.length > 0) {
        setSensorData(data[0]);
        setPreviousSmokePresence((data[0].presenca_fumaca || 0) > 150);
        setPreviousSensorData(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do sensor:', error);
    }
  };

  useEffect(() => {
  const showWelcomeToast = async () => {
    try {
      const hasLoggedBefore = await AsyncStorage.getItem('hasLoggedBefore');
      if (!hasLoggedBefore) {
        Toast.show({
          type: 'success',
          text1: 'Login realizado com sucesso!',
          text2: 'Bem-vindo à plataforma 👋',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          bottomOffset: 60,
        });
        await AsyncStorage.setItem('hasLoggedBefore', 'true');
      }
    } catch (error) {
      console.error('Erro ao exibir toast:', error);
    }
  };

  showWelcomeToast();
  fetchSensorData();

    // Set up real-time subscription for sensor data
    const subscription = supabaseData
      .channel('sensor_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leituras_sensores',
        },
        (payload) => {
          setSensorData(payload.new);
        }
      )
      .subscribe(() => {

      });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sensorData !== null && JSON.stringify(sensorData) !== JSON.stringify(previousSensorData)) {
      // Smoke presence notification logic
      const currentSmokePresence = (sensorData.presenca_fumaca || 0) > 150;

      if (previousSmokePresence !== null && currentSmokePresence && !previousSmokePresence) {
        Toast.show({
          type: 'error',
          text1: 'Fumaça detectada!',
          text2: 'O sensor de fumaça detectou presença de fumaça. Verifique o ambiente.',
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
          topOffset: 60,
        });
      }
      setPreviousSmokePresence(currentSmokePresence);

      // General sensor data change notification
      if (previousSensorData !== null) {
        Toast.show({
          type: 'info',
          text1: 'Atualização de Sensores',
          text2: `Temperatura: ${sensorData.temperatura}°C, Umidade: ${sensorData.umidade}%`,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 60,
        });
      }

      setPreviousSensorData(sensorData);
    }
  }, [sensorData, previousSensorData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTemp(), refetchWeather(), fetchSensorData()]);
    setRefreshing(false);
  };

  const loading = tempLoading || weatherLoading;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Temperatura Atual</Text>
          <TouchableOpacity 
            onPress={refetchTemp}
            style={styles.refreshButton}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#334155" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#334155" />
        ) : tempError ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-outline" size={24} color="#FF6B6B" />
            <Text style={[styles.temperature, styles.errorText]}>
              {tempError}
            </Text>
            <TouchableOpacity 
              onPress={refetchTemp}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.temperature}>
            {temperatura !== null ? `${temperatura}°` : 'Carregando...'}
          </Text>
        )}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="thermometer" size={22} color="#334155" />
          <MaterialCommunityIcons name="snowflake" size={22} color="#334155" />
          <MaterialCommunityIcons name="weather-snowy" size={22} color="#334155" />
        </View>
      </View>

      <View style={styles.secondPanel}>
        <View style={styles.row}>
          {[
            { icon: 'cloud', label: 'Fumaça', value: (sensorData?.presenca_fumaca || 0) > 150 ? 'Sim' : 'Não' },
            { icon: 'water', label: 'Umidade', value: sensorData?.umidade ? `${sensorData.umidade}%` : '---' },
            { icon: 'thermometer', label: 'Temperatura', value: `${temperatura ?? '---'}°C` },
          ].map(({ icon, label, value }, i) => (
            <View key={i} style={styles.infoBox}>
              <MaterialCommunityIcons name={icon as any} size={24} color="#334155" />
              <Text style={styles.infoText}>{label}</Text>
              <Text style={[styles.infoText, styles.infoValue]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.infoRow}>
            {weatherError ? (
              <>
                <MaterialCommunityIcons name="alert-outline" size={24} color="#FF6B6B" />
                <Text style={[styles.weatherDescription, styles.errorText]}>
                  {weatherError}
                </Text>
                <TouchableOpacity 
                  onPress={refetchWeather}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.weatherValue}>
                  {weather?.temp ? `${weather.temp.toFixed(1)}°C` : '22°C'}
                </Text>
                <Text style={styles.weatherDescription}>Ar livre</Text>
                <Text style={[styles.weatherDescription, styles.weatherSubtext]}>
                  {weather?.description || '---'}
                </Text>
                {lastRefresh && (
                  <Text style={[styles.weatherDescription, styles.timestampText]}>
                    Atualizado: {lastRefresh.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  panel: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  refreshButton: {
    padding: 5,
  },
  secondPanel: {
    width: '100%',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelTitle: {
    color: '#334155',
    fontSize: 18,
    fontWeight: '600',
  },
  temperature: {
    color: '#334155',
    fontSize: 48,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
  },
  infoBox: {
    width: windowWidth < 380 ? 80 : 90,
    height: windowWidth < 380 ? 80 : 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoText: {
    color: '#334155',
    marginTop: 4,
    fontSize: windowWidth < 380 ? 11 : 13,
    textAlign: 'center',
  },
  infoValue: {
    marginTop: 2,
    fontSize: windowWidth < 380 ? 12 : 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  infoRow: {
    flex: 1,
    alignItems: 'center',
    borderColor: '#F0F4F8',
    backgroundColor: '#F0F4F8',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  weatherValue: {
    color: '#334155',
    fontSize: windowWidth < 380 ? 20 : 24,
    fontWeight: 'bold',
  },
  weatherDescription: {
    color: '#334155',
    marginTop: 4,
  },
  weatherSubtext: {
    fontSize: 12,
    marginTop: 4,
    color: '#64748B',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 8,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
