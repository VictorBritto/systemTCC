import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import HomeScreen from '../screens/HomeScreen';
import PerfilScreen from '../screens/Perfil';
import SettingsScreen from '../screens/Settings';
import DashboardScreen from '../screens/Dashboard';
import CustomTabBar from '../components/CustomTabBar';
import PasswordResetScreen from '../screens/Password';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Password: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Perfil: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Password" component={PasswordResetScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
