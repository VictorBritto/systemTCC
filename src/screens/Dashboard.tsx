import React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ["", "", "", "", "", "", ""], // Esconde os nomes dos dias
  datasets: [
    {
      data: [20, 25, 21, 28, 23, 19, 22,],
      color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Cor da linha
      strokeWidth: 2,
    },
  ],
};



const chartConfig = {
  backgroundColor: '#121212',
  backgroundGradientFrom: '#121212',
  backgroundGradientTo: '#121212',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Cor do texto
  labelColor: () => '#fff',
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#fff',
    fill: '#ff0000',
  },
  propsForBackgroundLines: {
    stroke: '#333',
  },
  propsForLabels: {
    fontSize: 12,
  },
};



export default function CustomChart() {
  return (
    <View>
      {[1, 2].map(() => (
        <View style={styles.container} >
          <View style={styles.header}>
            <Text style={styles.mesText}>Mês</Text>
          </View>

          <LineChart
            data={data}
            width={screenWidth * 0.9}
            height={200}
            withShadow={true}
            withDots={true}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLabels={false}
            yLabelsOffset={10}
            yAxisSuffix="°"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
  },
  mesText: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft:'84%',
  },
  chart: {
    borderRadius: 16,
  },
});
