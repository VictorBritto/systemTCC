import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../routes/supabase';

const PasswordResetScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu e-mail.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'exp://127.0.0.1:19000/--/reset-password'
      });

      if (error) throw error;
      Alert.alert(
        'E-mail enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.'
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Redefinir senha</Text>
      <Text style={styles.subtitle}>
        Insira seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#999' }]}
        onPress={handlePasswordReset}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Enviando...' : 'Enviar link de redefinição'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordResetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#7DD3FC',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#7DD3FC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4c8bf5',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
