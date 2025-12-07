import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../routes/supabase';
import { useNavigation } from '@react-navigation/native';
import { registerBackgroundTask, unregisterBackgroundTask } from '../utils/backgroundTask';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { TextInput, Button } from 'react-native-paper';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    AsyncStorage.setItem('notifications_enabled', isNotificationsEnabled ? 'true' : 'false').catch(
      console.error
    );

    if (isNotificationsEnabled) {
      registerBackgroundTask().catch(console.error);
    } else {
      unregisterBackgroundTask().catch(console.error);
      Notifications.cancelAllScheduledNotificationsAsync().catch(console.error);
    }
  }, [isNotificationsEnabled]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications_enabled');
        if (stored !== null) setIsNotificationsEnabled(stored === 'true');
      } catch (err) {
        console.error('Erro ao carregar preferência de notificações:', err);
      }
    })();
  }, []);


  const toggleNotifications = () => {
    setIsNotificationsEnabled((previousState) => !previousState);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível alterar a senha');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Não foi possível sair: ' + error.message);
    } else {
      navigation.navigate('Login' as never);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.title}>Configurações</Text>

      <View style={styles.card}>
        <View style={styles.option}>
          <Text style={styles.optionText}>Notificações de Temperatura</Text>
          <Switch
            onValueChange={toggleNotifications}
            value={isNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#7DD3FC' }}
            thumbColor={isNotificationsEnabled ? '#93C5FD' : '#93C5FD'}
          />
        </View>

        <Text style={styles.description}>
          Receba alertas quando a temperatura estiver abaixo de 19°C ou acima de 25°C
        </Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.passwordButton}
          onPress={() => setIsChangingPassword(!isChangingPassword)}>
          <Text style={styles.optionText}>Alterar Senha</Text>
        </TouchableOpacity>

        {isChangingPassword && (
          <View style={styles.passwordForm}>
            <TextInput
              label="Nova Senha"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={styles.changePasswordButton}>
              Confirmar Alteração
            </Button>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Fazer logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 20,
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8,
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: '#7DD3FC',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordButton: {
    paddingVertical: 10,
  },
  passwordForm: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  changePasswordButton: {
    backgroundColor: '#7DD3FC',
    marginTop: 8,
  },
});
