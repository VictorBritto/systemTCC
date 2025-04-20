import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../routes/firebase';

type RegisterScreenProps = {
  onRegister: () => void;
  onLoginRedirect: () => void;
};

export default function RegisterScreen({ onRegister, onLoginRedirect }: RegisterScreenProps) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const handleRegister = async () => {
    if (password !== password2) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.navigate('Home' as never); // redireciona para a Home
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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
          label="Confirmar senha"
          value={password2}
          onChangeText={setPassword2}
          secureTextEntry
          style={styles.input}
          theme={{ colors: { primary: '#0C2489', background: '#f9f9f9' } }}
        />

        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Registrar
        </Button>

        <Text
          style={[styles.login, { fontFamily: 'Poppins-Medium' }]}
          onPress={() => onLoginRedirect()}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#121212',
    marginBottom: 20,
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
  login: {
    marginTop: 20,
    textAlign: 'center',
    color: '#121212',
    fontSize: 14,
    fontWeight: '600',
  },
});
