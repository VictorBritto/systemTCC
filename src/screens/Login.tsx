import React, { useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type LoginScreenProps = {
  onLogin: () => void;
  onRegisterRedirect: () => void; 
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button mode="contained" onPress={onLogin} style={styles.button}>
          Entrar
        </Button>

        <Text style={styles.forgotPassword} onPress={() => navigation.navigate('Register')}>
          Não tem uma conta ainda? Cadastrar-se
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    marginBottom: 30,
    borderRadius: 10,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C2489',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    color: '#0C2489',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#0C2489',
    paddingVertical: 12,
    borderRadius: 8,
  },
  forgotPassword: {
    marginTop: 20,
    textAlign: 'center',
    color: '#0C2489',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
