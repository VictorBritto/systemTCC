import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../routes/supabase'; 
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationsEnabled((previousState) => !previousState);
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

      <View style={styles.option}>
        <Text style={styles.optionText}>Notificações</Text>
        <Switch
          onValueChange={toggleNotifications}
          value={isNotificationsEnabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isNotificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
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
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
