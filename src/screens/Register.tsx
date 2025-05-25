import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../routes/supabase';

type RegisterScreenProps = {
  onRegister: () => void;
  onLoginRedirect: () => void;
};

export default function RegisterScreen({  }: RegisterScreenProps) {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

const handleRegister = async () => {
  if (password !== password2) {
    Alert.alert('Erro', 'As senhas não coincidem');
    return;
  }

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Conta criada com sucesso!');
    navigation.navigate('Login' as never);
  } catch (err: any) {
    Alert.alert('Erro', err.message || 'Erro ao registrar');
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.title, { fontFamily: 'Poppins-SemiBold' }]}>Seja bem-vindo!</Text>
        <Text style={[styles.subtitle, { fontFamily: 'Poppins-Medium' }]}>
          Faça seu cadastro agora mesmo
        </Text>

        <TextInput
          label="Nome"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />

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

        <TextInput
          label="Confirmar senha"
          value={password2}
          onChangeText={setPassword2}
          secureTextEntry
          style={styles.input}
        />

        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Registrar
        </Button>

        <Text
          style={[styles.login, { fontFamily: 'Poppins-Medium' }]}
          onPress={() => navigation.navigate('Login' as never)}
        >
          Já tem uma conta? Fazer login
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
    backgroundColor: '#D6D4CE',
  },
  card: {
    backgroundColor: '#D6D4CE',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#1E1E1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#1E1E1E',
    textAlign: 'center',
    opacity: 0.9,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: '#E63C3A',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  login: {
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
