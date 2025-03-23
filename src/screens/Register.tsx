import React, { useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';

type RegisterScreenProps = {
  onRegister: () => void;
  onLoginRedirect: () => void; 
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onLoginRedirect }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigation = useNavigation;

  return (
    <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <View style={styles.card}>
        <Text style={styles.title}>Cadastrar-se</Text>

        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          theme={{ colors: { primary: '#0C2489', background: '#f9f9f9' } }}
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          theme={{ colors: { primary: '#0C2489', background: '#f9f9f9' } }}
        />

        <TextInput
          label="Senha"
          value={password2}
          onChangeText={setPassword2}
          secureTextEntry
          style={styles.input}
          theme={{ colors: { primary: '#0C2489', background: '#f9f9f9' } }}
        />

        <Button mode="contained" onPress={onRegister} style={styles.button}>
          Registrar
        </Button>

        <Text style={styles.forgotPassword} onPress={() => navigation.navigate('LoginScreen')}>
          Já tem uma conta? Fazer login
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
    height: 100,
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

export default RegisterScreen;
