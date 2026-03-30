import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MapScreen from "../features/map/screens/MapScreen";
import { CalendarSelectionScreen } from "../features/calendarSelection/screens/CalendarSelectionScreen";
import FloorSelectionScreen from "../features/map/screens/FloorSelectionScreen";
import IndoorMapScreen from "../features/map/screens/IndoorMapScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet } from "react-native";

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
const styles = StyleSheet.create({
  container: { backgroundColor: "#912338" },
  header: { padding: 20, paddingBottom: 10 },
  title: { color: "white", fontSize: 22, fontWeight: "bold" },
});

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView
      {...props}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Menu
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

type DrawerIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

const renderDrawerContent = (props: DrawerContentComponentProps) => (
  <CustomDrawerContent {...props} />
);

const MapIcon = ({ color }: DrawerIconProps) => (
  <MaterialIcons name="map" size={24} color={color} />
);

const CalendarIcon = ({ color }: DrawerIconProps) => (
  <MaterialIcons name="calendar-today" size={24} color={color} />
);

export const AppNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="CampusMap"
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#912338" },
        headerTintColor: "white",
        drawerStyle: { backgroundColor: "#912338", width: 280 },
        drawerActiveTintColor: "#ffffff",
        drawerInactiveTintColor: "rgba(255,255,255,0.6)",
        drawerActiveBackgroundColor: "rgba(255,255,255,0.15)",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="CampusMap"
        component={MapStackNavigator}
        options={{
          title: "Campus Map",
          drawerLabel: "Map",
          headerShown: false,
          drawerIcon: MapIcon,
        }}
      />
      <Drawer.Screen
        name="Calendar"
        component={CalendarSelectionScreen}
        options={{
          title: "Calendar Selection",
          drawerLabel: "Calendars",
          drawerIcon: CalendarIcon,
        }}
      />
    </Drawer.Navigator>
  );
};
