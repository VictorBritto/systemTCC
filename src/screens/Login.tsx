import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
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

        <Text style={[styles.or]}>ou</Text>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()}>
            <AntDesign name="google" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6D4CE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#121212',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#121212',
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
    backgroundColor: '#E63C3A',
    paddingVertical: 6,
    borderRadius: 8,
  },
  cadastro: {
    marginTop: 20,
    textAlign: 'center',
    color: '#121212',
    fontSize: 14,
    fontWeight: '600',
  },
  or: {
    marginVertical: 20,
    fontSize: 16,
    marginTop: '10%',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '7%',
  },
  socialButton: {
    backgroundColor: '#E0E0E0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividir: {
    height: 1,
    width: '100%',
    marginTop: '10%',
    backgroundColor: 'rgba(0,0,0,0.20)',
    marginBottom: 12,
  },
});

export default LoginScreen;
