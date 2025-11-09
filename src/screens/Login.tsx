import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { supabase } from '../routes/supabase';
import { useGoogleAuth } from '../components/googleSignIn';


function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fontsLoaded] = useFonts({
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const { promptAsync } = useGoogleAuth(navigation); 

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      navigation.navigate('Main' as never);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao logar');
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.title, { fontFamily: 'Poppins-SemiBold' }]}>Olá de novo!</Text>
        <Text style={[styles.subtitle, { fontFamily: 'Poppins-Medium' }]}>
          Bem-vindo de volta! Você fez falta!
        </Text>

        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Text
        style={[styles.cadastro, { fontFamily: 'Poppins-Medium' }]}
        onPress={() => navigation.navigate('Password' as never)}>
          Esqueceu a senha?
        </Text>

        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Entrar
        </Button>

        <View style={styles.dividir} />

        <Text
          style={[styles.cadastro, { fontFamily: 'Poppins-Medium' }]}
          onPress={() => navigation.navigate('Register' as never)}
        >
          Não tem uma conta ainda? Cadastrar-se
        </Text>

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
    backgroundColor: '#F0F4F8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 3,
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#334155',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#334155',
    textAlign: 'center',
    opacity: 0.9,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: '#7DD3FC',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cadastro: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  dividir: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 20,
  },
  or: {
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  socialButton: {
    backgroundColor: '#E0E0E0',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});

export default LoginScreen;
