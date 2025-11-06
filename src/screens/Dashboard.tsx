import React, { useEffect, useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet, ScrollView, DimensionValue } from 'react-native';
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

export default function DashboardScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenWidth < 360;
  const isMediumScreen = screenWidth < 768;

  const getCardDimensions = () => {
    if (isSmallScreen) return { width: '100%' as DimensionValue, height: 130 };
    if (isMediumScreen) return { width: '47%' as DimensionValue, height: 140 };
    return { width: '23%' as DimensionValue, height: 150 };
  };

  const chartWidth = screenWidth / 2.2;
  const chartHeight = Math.min(screenHeight * 0.23, 200);

  const [temperatureData, setTemperatureData] = useState<ChartData>();
  const [humidityData, setHumidityData] = useState<ChartData>();
  const [FumacaData, setFumacaData] = useState<ChartData>();
  const [MaxData, setMaxData] = useState<ChartData>();
  const [loading, setLoading] = useState(true);
  const [humidity, setHumidity] = useState<number>(65);
  const [selectedPeriod, setSelectedPeriod] = useState<'Dia' | 'Semana' | 'Mes'>('Semana');

  const stats: StatCard[] = [
    { title: 'Média', value: '23°C', icon: 'thermometer', color: '#FF6B6B' },
    { title: 'Mínima', value: '19°C', icon: 'thermometer-low', color: '#4ECDC4' },
    { title: 'Máxima', value: '28°C', icon: 'thermometer-high', color: '#FFB236' },
    { title: 'Alertas', value: '3', icon: 'alert-circle', color: '#FF6B6B' },
  ];

  const alerts: Alert[] = [
    { id: 1, title: 'Temperatura abaixo do limite', time: 'Hoje, 14:30', severity: 'warning' },
    { id: 2, title: 'Umidade elevada detectada', time: 'Hoje, 12:15', severity: 'info' },
    { id: 3, title: 'Sistema em funcionamento normal', time: 'Hoje, 08:00', severity: 'success' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leituras_sensores')
        .select('temperatura, umidade, data_hora')
        .order('data_hora', { ascending: true })
        .limit(7);

      if (error) throw error;

      const labels =
        data?.map((reading) => {
          const date = new Date(reading.data_hora);
          return date.toLocaleDateString('pt-BR', { weekday: 'short' });
        }) || [];

      const tempChart: ChartData = {
        labels,
        datasets: [
          {
            data: data?.map((r) => r.temperatura) || [],
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      const humChart: ChartData = {
        labels,
        datasets: [
          {
            data: data?.map((r) => r.umidade) || [],
            color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      const fumacaChart: ChartData = {
        labels,
        datasets: [
          {
            data: data?.map((r) => r.umidade) || [],
            color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      }

      const maxChart: ChartData = {
        labels,
        datasets: [
          {
            data: data?.map((r) => r.umidade) || [],
            color: (opacity = 1) => `rgba(223, 41, 53, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      setTemperatureData(tempChart);
      setHumidityData(humChart);
      setFumacaData(fumacaChart);
      setMaxData(maxChart);

      if (data && data.length > 0) {
        setHumidity(data[data.length - 1].umidade || 65);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const chartConfig = {
    backgroundColor: '#1E1E1E',
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: () => '#999',
    propsForBackgroundLines: { 
      stroke: '#333', 
      strokeDasharray: '5, 5',
      strokeWidth: 1 
    },
    propsForLabels: { 
      fontSize: 11,
      fontWeight: '500' 
    },
    barRadius: 8,
    barPercentage: 0.4,
    categoryPercentage: 0.5,
  };

  const tempChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
    propsForDots: { r: '3', strokeWidth: '2', stroke: '#FF6B6B', fill: '#FF6B6B' },
  };

  const humChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
    propsForDots: { r: '0', strokeWidth: '0' },
  };

  const FumacaChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(253, 202, 64, ${opacity})`,
    barPercentage: 0.4,
    categoryPercentage: 0.5,
    fillShadowGradient: '#FDC640',
    fillShadowGradientOpacity: 0.8,
    strokeWidth: 2,
    barRadius: 8,
    propsForBackgroundLines: { 
      stroke: '#333', 
      strokeDasharray: '5, 5',
      strokeWidth: 1 
    },
    propsForLabels: { 
      fontSize: 11, 
      fontWeight: '600' 
    },
  };

  const MaxChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(223, 41, 53, ${opacity})`,
    barPercentage: 0.4,
    categoryPercentage: 0.5,
    fillShadowGradient: '#DF2935',
    fillShadowGradientOpacity: 0.8,
    strokeWidth: 2,
    barRadius: 8,
    propsForBackgroundLines: { 
      stroke: '#333', 
      strokeDasharray: '5, 5',
      strokeWidth: 1 
    },
    propsForLabels: { 
      fontSize: 11, 
      fontWeight: '600' 
    },
  };

  const getAlertColors = (severity: string) => {
    switch (severity) {
      case 'warning':
        return { bg: 'rgba(255,167,38,0.15)', border: '#FFA726' };
      case 'success':
        return { bg: 'rgba(76,175,80,0.15)', border: '#4CAF50' };
      default:
        return { bg: 'rgba(255,107,107,0.15)', border: '#FF6B6B' };
    }
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Ativo</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Gráficos lado a lado */}
          <View style={styles.graficos}>
            {/* Temperatura */}
            <View style={styles.chartContainer}>
              <Text style={styles.texto}>Temperatura</Text>
              {loading ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : temperatureData ? (
                <LineChart
                  data={temperatureData}
                  width={chartWidth}
                  height={chartHeight}
                  yAxisSuffix="°C"
                  withDots
                  withShadow={false}
                  withVerticalLabels={false}
                  chartConfig={tempChartConfig}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <Text style={styles.errorText}>Nenhum dado disponível</Text>
              )}
            </View>

            {/* Umidade */}
            <View style={styles.chartContainer}>
              <Text style={styles.texto}>Umidade</Text>
              {loading ? (
                <Text style={styles.loadingText}>Carregando...</Text>
              ) : humidityData ? (
                <LineChart
                  data={humidityData}
                  width={chartWidth}
                  height={chartHeight}
                  yAxisSuffix="%"
                  withDots
                  withShadow={false}
                  withVerticalLabels={false}
                  chartConfig={humChartConfig}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <Text style={styles.errorText}>Nenhum dado disponível</Text>
              )}
            </View>
          </View>

          <View style={styles.graficos}>
            {/* Detecção de Fumaça */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.texto}>Detecção de Fumaça</Text>
              </View>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando...</Text>
                </View>
              ) : FumacaData ? (
                <View style={styles.chartWrapper}>
                  <BarChart
                    data={FumacaData}
                    width={chartWidth}
                    height={chartHeight}
                    yAxisLabel=""
                    yAxisSuffix="ppm"
                    withInnerLines={true}
                    showBarTops={false}
                    withVerticalLabels={false}
                    withHorizontalLabels={true}
                    fromZero={true}
                    segments={4}
                    chartConfig={FumacaChartConfig}
                    style={styles.chart}
                  />
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Text style={styles.errorText}>Nenhum dado disponível</Text>
                </View>
              )}
            </View>

            {/* Temperatura Máx/Min */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.texto}>Temperatura Máx/Min</Text>
              </View>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando...</Text>
                </View>
              ) : MaxData ? (
                <View style={styles.chartWrapper}>
                  <BarChart
                    data={MaxData}
                    width={chartWidth}
                    height={chartHeight}
                    yAxisLabel=""
                    yAxisSuffix="°C"
                    withInnerLines={true}
                    showBarTops={false}
                    withVerticalLabels={false}
                    withHorizontalLabels={true}
                    fromZero={true}
                    segments={4}
                    chartConfig={MaxChartConfig}
                    style={styles.chart}
                  />
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Text style={styles.errorText}>Nenhum dado disponível</Text>
                </View>
              )}
            </View>
          </View>

          {/* Cards de estatísticas */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={[styles.statCard, getCardDimensions()]}>
                <MaterialCommunityIcons name={stat.icon} size={40} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>

          {/* Métrica de Umidade */}
          <View style={styles.metricsContainer}>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="water-percent" size={20} color="#00BCD4" />
                <Text style={styles.metricTitle}>Umidade</Text>
              </View>
              <Text style={styles.metricValue}>{humidity}%</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${humidity}%`, backgroundColor: '#00BCD4' },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Alertas Recentes */}
          <View style={styles.alertsContainer}>
            <Text style={styles.alertsTitle}>⚠️ Alertas Recentes</Text>
            {alerts.map((alert) => {
              const colors = getAlertColors(alert.severity);
              return (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    { backgroundColor: colors.bg, borderLeftColor: colors.border },
                  ]}>
                  <MaterialCommunityIcons
                    name={
                      alert.severity === 'warning'
                        ? 'alert'
                        : alert.severity === 'success'
                        ? 'check-circle'
                        : 'information'
                    }
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
    backgroundColor: '#1a1a1a' 
  },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#D6D4CE' 
  },
  contentContainer: { 
    width: '100%', 
    alignItems: 'center' 
  },
  header: { 
    width: '100%', 
    marginTop: 30, 
    marginBottom: 24 
  },
  texto: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#4CAF50' 
  },
  statusText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  graficos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    minWidth: 180,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chart: { 
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  loadingText: { 
    color: '#ccc' 
  },
  errorText: { 
    color: '#FF6B6B' 
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    marginVertical: 8,
  },
  statTitle: { 
    color: '#888'
  },
  metricsContainer: { 
    width: '100%', 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  metricCard: { 
    backgroundColor: '#1E1E1E', 
    borderRadius: 16, 
    padding: 16 
  },
  metricHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 12 
  },
  metricTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
  metricValue: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  progressBar: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#3a3a3a', 
    borderRadius: 4 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 4 
  },
  alertsContainer: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  alertsTitle: { 
    color: '#FFFFFF',
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 16 
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
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  alertTime: { 
    color: '#888', 
    fontSize: 12 
  },
});
