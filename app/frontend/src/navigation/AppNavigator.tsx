import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from '../features/map/screens/MapScreen';

// Define the types for the navigation stack
export type RootStackParamList = {
  CampusMap: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CampusMap" component={MapScreen} />
    </Stack.Navigator>
  );
};