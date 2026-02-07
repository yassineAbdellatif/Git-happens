import 'react-native-gesture-handler'; // Must be at the top
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <NavigationContainer>
      {/* Provides consistent status bar styling across the app */}
      <StatusBar style="dark" />
      
      {/* This renders the Stack.Navigator we defined in AppNavigator.tsx */}
      <AppNavigator />
    </NavigationContainer>
  );
}