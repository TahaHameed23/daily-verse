import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Home from './src/pages/Home';
import Favorites from './src/pages/Favorites';
import Settings from './src/pages/Settings';
import WidgetSetup from './src/pages/WidgetSetup';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return '🏠';
      case 'Favorites':
        return '❤️';
      case 'Widget':
        return '📱';
      case 'Settings':
        return '⚙️';
      default:
        return '📄';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ 
        fontSize: 24, 
        opacity: focused ? 1 : 0.6,
        color: focused ? '#0066cc' : '#666'
      }}>
        {getIcon()}
      </Text>
    </View>
  );
};const App: React.FC = () => {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => (
              <TabIcon name={route.name} focused={focused} />
            ),
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 50,
              paddingBottom: 2,
              paddingTop: 2,
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Favorites" component={Favorites} />
          <Tab.Screen name="Widget" component={WidgetSetup} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
};

export default App;
