// src/components/CustomTabBar.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;

        let iconName: string;
        switch (route.name) {
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
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={[styles.tabButton, isFocused && styles.activeTab]}>
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? 'black' : 'white'}
            />
            {isFocused && (
              <Text style={styles.activeLabel}>
                {label === 'Home' ? 'Início' : ''}
                {label === 'Dashboard' ? 'Dashboard' : ''}
                {label === 'Perfil' ? 'Perfil' : ''}
                {label === 'Settings' ? 'Configuração' : ''}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginLeft: 6,
  },
});

export default CustomTabBar;
