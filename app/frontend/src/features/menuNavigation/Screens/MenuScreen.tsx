import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../Styles/MenuScreenStyle";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const MenuScreen = ({ navigation }: any) => {
  const menuItems = [
    { id: 'settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
    { id: 'calendars', label: 'Calendars', icon: 'calendar-outline', screen: 'Calendar', isIonic: true },
    { id: 'map', label: 'Map', icon: 'map', screen: 'CampusMap' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            {item.isIonic ? (
              <Ionicons name={item.icon as any} size={40} color="#333" />
            ) : (
              <MaterialIcons name={item.icon as any} size={40} color="#333" />
            )}
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};



export default MenuScreen;