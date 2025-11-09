import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  useWindowDimensions, 
  StyleSheet, 
  ScrollView, 
  DimensionValue,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../routes/supabase';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
}

interface StatCard {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

interface Alert {
  id: number;
  title: string;
  time: string;
  severity: 'warning' | 'info' | 'success';
}

interface SensorReading {
  temperatura: number;
  umidade: number;
  fumaca?: number;
  data_hora: string;
}

export default function DashboardScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Estados
  const [temperatureData, setTemperatureData] = useState<ChartData | null>(null);
  const [humidityData, setHumidityData] = useState<ChartData | null>(null);
  const [fumacaData, setFumacaData] = useState<ChartData | null>(null);
  const [maxMinData, setMaxMinData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    avgTemp: 23,
    minTemp: 19,
    maxTemp: 28,
    humidity: 65,
    alerts: 3
  });

  // Dimensões responsivas
  const dimensions = useMemo(() => {
    const isSmallScreen = screenWidth < 360;
    const isMediumScreen = screenWidth < 768;
    
    return {
      cardWidth: (isSmallScreen ? '100%' : isMediumScreen ? '47%' : '23%') as DimensionValue,
      cardHeight: isSmallScreen ? 130 : isMediumScreen ? 140 : 150,
      chartWidth: screenWidth / 2.4,
      chartHeight: 160
    };
  }, [screenWidth, screenHeight]);

  // Configurações dos gráficos
  const chartConfigs = useMemo(() => {
    const baseConfig = {
      backgroundColor: '#FFFFFF',
      backgroundGradientFrom: '#FFFFFF',
      backgroundGradientTo: '#FFFFFF',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
      labelColor: () => '#64748B',
      propsForBackgroundLines: { 
        stroke: '#E2E8F0', 
        strokeDasharray: '5, 5',
        strokeWidth: 1 
      },
      propsForLabels: { 
        fontSize: 11,
        fontWeight: '500' 
      },
    };

    return {
      temperature: {
        ...baseConfig,
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        propsForDots: { 
          r: '4', 
          strokeWidth: '2', 
          stroke: '#FF6B6B', 
          fill: '#FF6B6B' 
        },
      },
      humidity: {
        ...baseConfig,
        color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
        propsForDots: { 
          r: '0', 
          strokeWidth: '2', 
          stroke: '#00BCD4', 
          fill: '#00BCD4' 
        },
      },
      fumaca: {
        ...baseConfig,
        color: (opacity = 1) => `rgba(253, 202, 64, ${opacity})`,
        barPercentage: 0.5,
        fillShadowGradient: '#FDC640',
        fillShadowGradientOpacity: 0.8,
        barRadius: 8,
      },
      maxMin: {
        ...baseConfig,
        color: (opacity = 1) => `rgba(223, 41, 53, ${opacity})`,
        barPercentage: 0.5,
        fillShadowGradient: '#DF2935',
        fillShadowGradientOpacity: 0.8,
        barRadius: 8,
      }
    };
  }, []);

  // Processar dados
  const processChartData = useCallback((readings: SensorReading[]) => {
    if (!readings || readings.length === 0) return null;

    const labels = readings.map((reading) => {
      const date = new Date(reading.data_hora);
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    });

    const temperatures = readings.map(r => r.temperatura);
    const humidities = readings.map(r => r.umidade);
    const fumacas = readings.map(r => r.fumaca || Math.random() * 8); // Simulado se não existir

    // Calcular min/max
    const maxTemps = readings.map(r => r.temperatura + Math.random() * 5);
    const minTemps = readings.map(r => r.temperatura - Math.random() * 5);

    // Calcular estatísticas
    const avgTemp = Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length);
    const minTemp = Math.round(Math.min(...temperatures));
    const maxTemp = Math.round(Math.max(...temperatures));
    const currentHumidity = Math.round(humidities[humidities.length - 1]);

    setCurrentStats({
      avgTemp,
      minTemp,
      maxTemp,
      humidity: currentHumidity,
      alerts: 3 // Pode ser calculado com base em condições
    });

    return {
      temperature: {
        labels,
        datasets: [{
          data: temperatures,
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          strokeWidth: 2,
        }],
      },
      humidity: {
        labels,
        datasets: [{
          data: humidities,
          color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
          strokeWidth: 2,
        }],
      },
      fumaca: {
        labels,
        datasets: [{
          data: fumacas,
          color: (opacity = 1) => `rgba(253, 202, 64, ${opacity})`,
        }],
      },
      maxMin: {
        labels,
        datasets: [{
          data: maxTemps.map((max, i) => max - minTemps[i]),
          color: (opacity = 1) => `rgba(223, 41, 53, ${opacity})`,
        }],
      }
    };
  }, []);

  // Buscar dados
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leituras_sensores')
        .select('temperatura, umidade, fumaca, data_hora')
        .order('data_hora', { ascending: true })
        .limit(7);

      if (error) throw error;

      const processedData = processChartData(data);
      
      if (processedData) {
        setTemperatureData(processedData.temperature);
        setHumidityData(processedData.humidity);
        setFumacaData(processedData.fumaca);
        setMaxMinData(processedData.maxMin);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [processChartData]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats cards
  const stats: StatCard[] = useMemo(() => [
    { 
      title: 'Média', 
      value: `${currentStats.avgTemp}°C`, 
      icon: 'thermometer', 
      color: '#FF6B6B' 
    },
    { 
      title: 'Mínima', 
      value: `${currentStats.minTemp}°C`, 
      icon: 'thermometer-low', 
      color: '#4ECDC4' 
    },
    { 
      title: 'Máxima', 
      value: `${currentStats.maxTemp}°C`, 
      icon: 'thermometer-high', 
      color: '#FFB236' 
    },
    { 
      title: 'Alertas', 
      value: `${currentStats.alerts}`, 
      icon: 'alert-circle', 
      color: '#FF6B6B' 
    },
  ], [currentStats]);

  const alerts: Alert[] = [
    { 
      id: 1, 
      title: 'Temperatura abaixo do limite', 
      time: 'Hoje, 14:30', 
      severity: 'warning' 
    },
    { 
      id: 2, 
      title: 'Umidade elevada detectada', 
      time: 'Hoje, 12:15', 
      severity: 'info' 
    },
    { 
      id: 3, 
      title: 'Sistema em funcionamento normal', 
      time: 'Hoje, 08:00', 
      severity: 'success' 
    },
  ];

  const getAlertColors = (severity: string) => {
    switch (severity) {
      case 'warning':
        return { bg: 'rgba(255,167,38,0.15)', border: '#FFA726', icon: 'alert' };
      case 'success':
        return { bg: 'rgba(76,175,80,0.15)', border: '#4CAF50', icon: 'check-circle' };
      default:
        return { bg: 'rgba(33,150,243,0.15)', border: '#2196F3', icon: 'information' };
    }
  };

  const ChartCard = ({ 
    title, 
    data, 
    config, 
    type = 'line',
    suffix 
  }: { 
    title: string; 
    data: ChartData | null; 
    config: any; 
    type?: 'line' | 'bar';
    suffix: string;
  }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : data ? (
        type === 'line' ? (
          <LineChart
            data={data}
            width={dimensions.chartWidth}
            height={dimensions.chartHeight}
            yAxisSuffix={suffix}
            withDots
            withShadow={false}
            withVerticalLabels={false}
            chartConfig={config}
            bezier
            style={styles.chart}
          />
        ) : (
          <BarChart
            data={data}
            width={dimensions.chartWidth}
            height={dimensions.chartHeight}
            yAxisLabel=""
            yAxisSuffix={suffix}
            withInnerLines={true}
            showBarTops={false}
            withVerticalLabels={false}
            fromZero={true}
            segments={4}
            chartConfig={config}
            style={styles.chart}
          />
        )
      ) : (
        <Text style={styles.errorText}>Nenhum dado disponível</Text>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#FF6B6B"
          colors={['#FF6B6B']}
        />
      }
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Ativo</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Gráficos Linha 1 */}
          <View style={styles.chartsRow}>
            <ChartCard 
              title="Temperatura" 
              data={temperatureData}
              config={chartConfigs.temperature}
              type="line"
              suffix="°C"
            />
            <ChartCard 
              title="Umidade" 
              data={humidityData}
              config={chartConfigs.humidity}
              type="line"
              suffix="%"
            />
          </View>

          {/* Gráficos Linha 2 */}
          <View style={styles.chartsRow}>
            <ChartCard 
              title="Detecção de Fumaça" 
              data={fumacaData}
              config={chartConfigs.fumaca}
              type="bar"
              suffix="ppm"
            />
            <ChartCard 
              title="Temperatura Máx/Min" 
              data={maxMinData}
              config={chartConfigs.maxMin}
              type="bar"
              suffix="°C"
            />
          </View>

          {/* Cards de estatísticas */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View 
                key={index} 
                style={[
                  styles.statCard, 
                  { 
                    width: dimensions.cardWidth, 
                    height: dimensions.cardHeight 
                  }
                ]}
              >
                <MaterialCommunityIcons 
                  name={stat.icon} 
                  size={40} 
                  color={stat.color} 
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>


          {/* Alertas Recentes */}
          <View style={styles.alertsContainer}>
            <View style={styles.alertsHeader}>
              <MaterialCommunityIcons 
                name="bell-ring" 
                size={20} 
                color="#FFA726" 
              />
              <Text style={styles.alertsTitle}>Alertas Recentes</Text>
            </View>
            {alerts.map((alert) => {
              const colors = getAlertColors(alert.severity);
              return (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    { 
                      backgroundColor: colors.bg, 
                      borderLeftColor: colors.border 
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={colors.icon as any}
                    size={20}
                    color={colors.border}
                  />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertText}>{alert.title}</Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  scrollView: { 
    flex: 1, 
    backgroundColor: '#F0F4F8' 
  },
  container: { 
    flex: 1, 
    padding: 16, 
    paddingBottom: 32, 
  },
  contentContainer: { 
    width: '100%', 
    alignItems: 'center',
  },
  header: { 
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24 
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#334155',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#4CAF50' 
  },
  statusText: { 
    color: '#4CAF50', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingVertical: 10,
    paddingHorizontal:8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 200,
  },
  chartTitle: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: { 
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  errorText: { 
    color: '#FF6B6B',
    fontSize: 12,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statValue: { 
    color: '#334155', 
    fontSize: 24,
    fontWeight: 'bold', 
    marginTop: 8,
  },
  statTitle: { 
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  humidityCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  humidityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  humidityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  humidityValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginBottom: 12,
  },
  humidityLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  progressBar: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#E2E8F0', 
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 4,
  },
  alertsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  alertsTitle: { 
    color: '#334155',
    fontSize: 16, 
    fontWeight: 'bold',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertInfo: { 
    marginLeft: 12, 
    flex: 1 
  },
  alertText: { 
    color: '#334155', 
    fontSize: 14, 
    fontWeight: '500',
    marginBottom: 4,
  },
  alertTime: { 
    color: '#64748B', 
    fontSize: 12 
  },
});

