import React, { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTemperature } from '../hooks/useTemperature';
import { useWeather } from '../hooks/useWeather';
import { config } from '../config';

const windowWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { temperatura, loading: tempLoading, error: tempError, refetch: refetchTemp } = useTemperature();
  const { weather, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeather();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTemp(), refetchWeather()]);
    setRefreshing(false);
  };

  if (tempError || weatherError) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-outline" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{tempError || weatherError}</Text>
      </View>
    );
  }

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
        <Text style={styles.panelTitle}>Temperatura Atual</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.temperature}>
            {temperatura !== null ? `${temperatura}°` : 'Carregando...'}
          </Text>
        )}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="thermometer" size={22} color="white" />
          <MaterialCommunityIcons name="snowflake" size={22} color="white" />
          <MaterialCommunityIcons name="weather-snowy" size={22} color="white" />
        </View>
      </View>

      <View style={styles.secondPanel}>
        <View style={styles.row}>
          {[
            { icon: 'cloud', label: 'Fumaça', value: '0%' },
            { icon: 'water', label: 'Umidade', value: weather?.temp ? '60%' : '---' },
            { icon: 'thermometer', label: 'Temperatura', value: `${temperatura ?? '---'}°C` },
            { icon: 'human-greeting', label: 'Presença', value: 'Não' },
          ].map(({ icon, label, value }, i) => (
            <View key={i} style={styles.infoBox}>
              <MaterialCommunityIcons name={icon as any} size={24} color="white" />
              <Text style={styles.infoText}>{label}</Text>
              <Text style={[styles.infoText, styles.infoValue]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.infoRow}>
            <Text style={styles.weatherValue}>
              {weather?.temp ? `${weather.temp.toFixed(1)}°C` : '22°C'}
            </Text>
            <Text style={styles.weatherDescription}>Ar livre</Text>
            <Text style={[styles.weatherDescription, styles.weatherSubtext]}>
              {weather?.description || '---'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.weatherValue}>
              {temperatura !== null ? `${temperatura}°C` : '---'}
            </Text>
            <Text style={styles.weatherDescription}>Atual</Text>
            <Text style={[styles.weatherDescription, styles.weatherSubtext]}>
              {temperatura !== null && (
                temperatura < config.temperature.lowerThreshold
                  ? 'Abaixo do limite!'
                  : temperatura > config.temperature.upperThreshold
                    ? 'Acima do limite!'
                    : 'Normal'
              )}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#D6D4CE',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#D6D4CE',
  },
  panel: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondPanel: {
    width: '100%',
    padding: 30,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  temperature: {
    color: '#fff',
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
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoText: {
    color: '#fff',
    marginTop: 4,
    fontSize: windowWidth < 380 ? 11 : 13,
    textAlign: 'center',
  },
  infoValue: {
    marginTop: 2,
    fontSize: windowWidth < 380 ? 12 : 14,
    fontWeight: 'bold',
    color: '#D9D9D9',
  },
  infoRow: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  weatherValue: {
    color: '#fff',
    fontSize: windowWidth < 380 ? 20 : 24,
    fontWeight: 'bold',
  },
  weatherDescription: {
    color: '#E0E0E0',
    marginTop: 4,
  },
  weatherSubtext: {
    fontSize: 12,
    marginTop: 4,
    color: '#D9D9D9',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
  },
});
