import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/Dashboard';
import SettingsScreen from '../screens/Settings';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import PerfilScreen from '~/screens/Peril';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((routes, index) => {
        const { options } = descriptors[routes.key];
        const label = options.tabBarLabel ?? routes.name;

        let iconName: string;
        switch (routes.name) {
          case 'Home':
            iconName = 'home-outline';
            break;
          case 'Dashboard':
            iconName = 'grid-outline';
            break;
          case 'Perfil':
            iconName = 'person-outline';
            break;
          case 'Settings':
            iconName = 'settings-outline';
            break;
            
          default:
            iconName = 'ellipse-outline';
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: routes.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(routes.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused && styles.activeTab,
            ]}
          >
            <Ionicons
              name={iconName as any}
              size={24}
              color={isFocused ? 'black' : 'white'}
            />
            {isFocused && (
              <Text style={styles.activeLabel}>
                {label === 'Home' ? 'Início' : ''}
              </Text>
            )}
            {isFocused && (
              <Text style={styles.activeLabel}>
                {label === 'Dashboard' ? 'Dashboard' : ''}
              </Text>
            )}
             {isFocused && (
              <Text style={styles.activeLabel}>
                {label === 'Perfil' ? 'Perfil' : ''}
              </Text>
            )}
            {isFocused && (
              <Text style={styles.activeLabel}>
                {label === 'Settings' ? 'Configuração' : ''}
              </Text>
            )}
           
          </TouchableOpacity>
          
        );
      })}
    </View>
  );
};


const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      
    </Tab.Navigator>
  );
};

const Routes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => (
                <RegisterScreen
                  {...props}
                  onRegister={() => setIsLoggedIn(true)}
                  onLoginRedirect={() => {}}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#121212',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderRadius: 40,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  activeTab: {
    backgroundColor: '#ddd',
  },
  activeLabel: {
    color: 'black',
    marginLeft: 0,
  },
});

export default Routes;
