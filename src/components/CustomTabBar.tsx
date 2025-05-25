import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width: screenWidth } = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? route.name;

          let iconName: keyof typeof Ionicons.glyphMap;
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
                size={22}
                color={isFocused ? '#1E1E1E' : '#E0E0E0'}
              />
              {isFocused && (
                <Text style={styles.activeLabel}>
                  {label === 'Home' ? 'Início' : ''}
                  {label === 'Dashboard' ? 'Dashboard' : ''}
                  {label === 'Perfil' ? 'Perfil' : ''}
                  {label === 'Settings' ? 'Configurações' : ''}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: '#E4E1DB', // fundo igual ao fundo do app
    paddingBottom: 10,
    paddingTop: 5,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 30,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: screenWidth < 380 ? 10 : 14,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#D9D9D9',
  },
  activeLabel: {
    color: '#1E1E1E',
    marginLeft: 6,
    fontSize: screenWidth < 380 ? 12 : 14,
    fontWeight: '600',
  },
});

export default CustomTabBar;
