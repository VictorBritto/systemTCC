// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Db } from '../routes/firebase';  // Certifique-se de que o Firebase está configurado corretamente
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function App() {
  const [temperatura, setTemperatura] = useState(null); // Estado para armazenar a temperatura

  useEffect(() => {
    const fetchTemperatura = async () => {
      try {
        const q = query(
          collection(Db, "leituras_sensores"),
          orderBy("data_hora", "desc"),  // Ordena para pegar a mais recente
          limit(1)  // Limita a 1 leitura mais recente
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setTemperatura(data.temperatura);  // Atualiza o estado com a temperatura
        });
      } catch (error) {
        console.error("Erro ao buscar dados do Firebase: ", error);
      }
    };

    fetchTemperatura();
  }, []);

  return (
    <View style={styles.container}>
      {/* Painel Temperatura Atual */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Temperatura Atual</Text>
        <Text style={styles.temperature}>{temperatura ? `${temperatura}°` : 'Carregando...'}</Text>
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
