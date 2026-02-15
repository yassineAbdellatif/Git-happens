import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MapScreen from '../features/map/screens/MapScreen';
import CalendarScreen from '../features/Calendar/screen/CalendarScreen';
// If you still want the Menu screen as an option, keep it; otherwise, remove it.
import MenuScreen from '../features/menuNavigation/Screens/MenuScreen'; 

// Define the names for your Drawer items
export type RootDrawerParamList = {
  CampusMap: undefined;
  Calendar: undefined;
  Menu: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export const AppNavigator = () => {
  return (
    <Drawer.Navigator 
      initialRouteName="CampusMap"
      screenOptions={{ 
        headerShown: true, // Usually true for Drawer so you see the Hamburger icon
        headerStyle: { backgroundColor: '#912338' },
        headerTintColor: 'white',
        drawerStyle: { backgroundColor: '#912338', width: '75%' },
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: 'rgba(255,255,255,0.7)',
      }}
    >
   
      <Drawer.Screen 
        name="CampusMap" 
        component={MapScreen} 
        options={{ title: 'Campus Map' }} 
      />
      
      <Drawer.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'Events Calendar' }}
      />

      {/* Optional: keep for now, delete later if you don't use it */}
      <Drawer.Screen 
        name="Menu" 
        component={MenuScreen} 
      />
    </Drawer.Navigator>
  );
};