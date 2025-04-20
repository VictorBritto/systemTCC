import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Suas telas
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/Dashboard';
import PerfilScreen from '../screens/Perfil';
import SettingsScreen from '../screens/Settings';

// Importar a CustomTabBar
import CustomTabBar from '../components/CustomTabBar'; // Certifique-se de ajustar o caminho corretamente

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
