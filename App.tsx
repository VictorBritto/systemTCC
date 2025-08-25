import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/routes/AppNavigator';

// Error Boundary para capturar erros
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
          <Text style={styles.errorText}>
            O app encontrou um problema inesperado.
          </Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  errorDetails: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    fontFamily: 'monospace',
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
