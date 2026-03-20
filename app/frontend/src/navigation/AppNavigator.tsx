import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import MapScreen from "../features/map/screens/MapScreen";
import { CalendarSelectionScreen } from "../features/calendarSelection/screens/CalendarSelectionScreen";
import FloorSelectionScreen from "../features/map/screens/FloorSelectionScreen";
import IndoorMapScreen from "../features/map/screens/IndoorMapScreen";

export type MapStackParamList = {
  MapMain: undefined;
  FloorSelectionScreen: {
    buildingId: string;
    buildingName: string;
    supportedFloors: string[];
  };
  IndoorMapScreen: {
    buildingId: string;
    selectedFloorNumber: string;
    buildingName: string;
  };
};

const MapStack = createStackNavigator<MapStackParamList>();

const MapStackNavigator = () => {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapMain" component={MapScreen} />
      <MapStack.Screen
        name="FloorSelectionScreen"
        component={FloorSelectionScreen}
      />
      <MapStack.Screen name="IndoorMapScreen" component={IndoorMapScreen} />
    </MapStack.Navigator>
  );
};

export type RootDrawerParamList = {
  CampusMap: undefined;
  Calendar: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export const AppNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="CampusMap"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#912338" },
        headerTintColor: "white",
        drawerStyle: { backgroundColor: "#f8f8f8", width: 280 },
        drawerActiveTintColor: "#912338",
        drawerInactiveTintColor: "#666",
      }}
    >
      <Drawer.Screen
        name="CampusMap"
        component={MapStackNavigator}
        options={{
          title: "Campus Map",
          drawerLabel: "Map",
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Calendar"
        component={CalendarSelectionScreen}
        options={{ title: "Calendar Selection", drawerLabel: "Calendars" }}
      />
    </Drawer.Navigator>
  );
};
