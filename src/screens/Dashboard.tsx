import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }[];
}

export default function CustomChart() {
  const [dataChart, setDataChart] = useState<ChartData | undefined>(undefined);

  const fetchData = async () => {
    const fetchedData: ChartData = {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          data: [20, 25, 21, 28, 23, 19, 22],
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
    setDataChart(fetchedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartConfig = {
    backgroundColor: '#121212',
    backgroundGradientFrom: '#121212',
    backgroundGradientTo: '#121212',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mesText}>Mês</Text>
        </View>

        {/* Verifique se os dados estão disponíveis antes de renderizar o gráfico */}
        {dataChart ? (
          <LineChart
            data={dataChart}
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
        ) : (
          <Text style={styles.loadingText}>Carregando...</Text>
        )}
      </View>
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
  mesText: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: '84%',
  },
  chart: {
    borderRadius: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
