import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MapScreen from "../features/map/screens/MapScreen";
import { CalendarSelectionScreen } from "../features/calendarSelection/screens/CalendarSelectionScreen";

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
        component={MapScreen}
        options={{ title: "Campus Map", drawerLabel: "Map", headerShown: false }}
      />
      <Drawer.Screen
        name="Calendar"
        component={CalendarSelectionScreen}
        options={{ title: "Calendar Selection", drawerLabel: "Calendars" }}
      />
    </Drawer.Navigator>
  );
};
