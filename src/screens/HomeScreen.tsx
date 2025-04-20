// App.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Painel Temperatura Atual */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Temperatura Atual</Text>
        <Text style={styles.temperature}>18°</Text>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="thermometer" size={22} color="white" />
          <MaterialCommunityIcons name="snowflake" size={22} color="white" />
          <MaterialCommunityIcons name="weather-snowy" size={22} color="white" />
        </View>
      </View>

      {/* Painel Inferior */}
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
    marginHorizontal: 10, // espaço entre eles
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