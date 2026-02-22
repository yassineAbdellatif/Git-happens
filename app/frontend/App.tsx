import "react-native-gesture-handler"; 
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

// 1. Ensure these imports are correct
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../frontend/src/features/auth/config/firebaseConfig";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import { CalendarSelectionProvider } from "./src/context/CalendarSelectionContext";

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Renamed this function to avoid shadowing the Firebase import
  function handleAuthStateChange(user: User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  // Listen for authentication state changes
  useEffect(() => {
    
    // Subscribe to auth state changes and get the unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {user ? (
        <CalendarSelectionProvider>
          <AppNavigator />
        </CalendarSelectionProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}