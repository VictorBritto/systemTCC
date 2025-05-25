import React, { useEffect, useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet, ScrollView, TouchableOpacity, Dimensions, DimensionValue } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../routes/supabase';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }[];
}

interface StatCard {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

export default function DashboardScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenWidth < 360;
  const isMediumScreen = screenWidth < 768;

  // Calculate responsive dimensions
  const getCardDimensions = () => {
    if (isSmallScreen) {
      return {
        width: '100%' as DimensionValue,
        height: 120,
      };
    } else if (isMediumScreen) {
      return {
        width: '47%' as DimensionValue,
        height: 130,
      };
    }
    return {
      width: '23%' as DimensionValue,
      height: 140,
    };
  };

  // Adjust chart dimensions to prevent overflow
  const containerPadding = 32; // Total horizontal padding (16 * 2)
  const chartContainerPadding = 40; // Total horizontal padding (20 * 2)
  const availableWidth = screenWidth - containerPadding - chartContainerPadding;
  const chartWidth = Math.min(availableWidth, 800);
  const chartHeight = Math.min(screenHeight * 0.25, 220);

  const [dataChart, setDataChart] = useState<ChartData | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<'Dia' | 'Semana' | 'Mes'>('Semana');
  const [loading, setLoading] = useState(true);

  const stats: StatCard[] = [
    {
      title: 'Média',
      value: '23°C',
      icon: 'thermometer',
      color: '#FF6B6B',
    },
    {
      title: 'Mínima',
      value: '19°C',
      icon: 'thermometer-low',
      color: '#4ECDC4',
    },
    {
      title: 'Máxima',
      value: '28°C',
      icon: 'thermometer-high',
      color: '#FFB236',
    },
    {
      title: 'Alertas',
      value: '3',
      icon: 'alert-circle',
      color: '#FF6B6B',
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('leituras_sensores')
        .select('temperatura, data_hora')
        .order('data_hora', { ascending: true })
        .limit(7);

      if (error) throw error;

      const chartData: ChartData = {
        labels: data?.map(reading => {
          const date = new Date(reading.data_hora);
          return date.toLocaleDateString('pt-BR', { weekday: 'short' });
        }) || [],
        datasets: [
          {
            data: data?.map(reading => reading.temperatura) || [],
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      setDataChart(chartData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const chartConfig = {
    backgroundColor: '#121212',
    backgroundGradientFrom: '#121212',
    backgroundGradientTo: '#121212',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: () => '#fff',
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FF6B6B',
      fill: '#121212',
    },
    propsForBackgroundLines: {
      stroke: '#333',
      strokeDasharray: '5, 5',
    },
    propsForLabels: {
      fontSize: 10, // Reduced font size for better fit
    },
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.periodSelector}
            onPress={() => setSelectedPeriod(selectedPeriod === 'Dia' ? 'Semana' : 'Dia')}>
            <Text style={styles.periodText}>{selectedPeriod}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={[styles.chartContainer]}>
            {loading ? (
              <View style={[styles.loadingContainer, { height: chartHeight }]}>
                <Text style={styles.loadingText}>Carregando...</Text>
              </View>
            ) : dataChart ? (
              <LineChart
                data={dataChart}
                width={chartWidth}
                height={chartHeight}
                withShadow={false}
                withDots={true}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                yAxisSuffix="°"
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <Text style={styles.errorText}>Nenhum dado disponível</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[
                  styles.statCard,
                  getCardDimensions(),
                  { backgroundColor: '#1E1E1E' },
                ]}>
                <MaterialCommunityIcons 
                  name={stat.icon} 
                  size={isSmallScreen ? 20 : 24} 
                  color={stat.color} 
                />
                <Text style={[
                  styles.statValue, 
                  { fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 24 }
                ]}>
                  {stat.value}
                </Text>
                <Text style={[
                  styles.statTitle, 
                  { fontSize: isSmallScreen ? 12 : 14 }
                ]}>
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.alertsContainer, { backgroundColor: '#1E1E1E' }]}>
            <Text style={styles.alertsTitle}>Últimos Alertas</Text>
            <View style={styles.alertCard}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#FF6B6B" />
              <View style={styles.alertInfo}>
                <Text style={styles.alertText}>Temperatura abaixo do limite</Text>
                <Text style={styles.alertTime}>Hoje, 14:30</Text>
              </View>
            </View>
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
    padding: 16,
    backgroundColor: '#D6D4CE',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 50,
  },
  periodSelector: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center', // Center the chart
    width: '100%', // Take full width of parent
    overflow: 'hidden', // Prevent content from spilling out
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statTitle: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  alertsContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  alertsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertInfo: {
    marginLeft: 12,
    flex: 1,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  alertTime: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
});
