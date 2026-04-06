import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { styles } from "../styles/loginScreenStyle";
import Constants from "expo-constants";

// Import the context hook to set the calendar access token
import { useCalendarSelection } from "../../../context/CalendarSelectionContext";

let GoogleSignin: any = null;
let statusCodes: any = null;

const isExpoGo = Constants.executionEnvironment === "storeClient";

if (!isExpoGo) {
  const GSignin = require("@react-native-google-signin/google-signin");
  GoogleSignin = GSignin.GoogleSignin;
  statusCodes = GSignin.statusCodes;

  GoogleSignin.configure({
    webClientId:
      "332552903248-0mra762jsq6vqirkeim0bef7p4jno3vg.apps.googleusercontent.com",
    iosClientId:
      "332552903248-vb70apsfbeof7en4l4i5tbkn75ifr6nc.apps.googleusercontent.com",
    offlineAccess: true,
    // MODIFICATION 1: Request Calendar permissions upfront
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"], 
  });
}

export const LoginScreen = ({ navigation }: any) => {
  // MODIFICATION 2: Extract the setter from the context
  const { setGoogleCalendarAccessToken } = useCalendarSelection();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated user:", user.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (isExpoGo) {
      Alert.alert(
        "Expo Go Limited",
        "Native Google Sign-In is only available in the Development Build. Please run 'npx expo run:ios' to test this feature.",
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error("No ID Token found");

      // MODIFICATION 3: Explicitly request the access token and save it
      const tokens = await GoogleSignin.getTokens();
      if (tokens.accessToken) {
        setGoogleCalendarAccessToken(tokens.accessToken);
        console.log("Calendar Token successfully saved to context!");
      }

      // Proceed with Firebase Auth
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      console.log("Google Sign-In successful:", result.user.displayName);
      
    } catch (error: any) {
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        console.log("User cancelled");
      } else {
        console.error("Detailed Login Error:", error);
        Alert.alert(
          "Login Error",
          "Something went wrong during Google Sign-In.",
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Campus Guide</Text>
      <Text style={styles.subText}>
        {isExpoGo ? "(Running in Expo Go Mode)" : "Sign in to access maps"}
      </Text>

      <TouchableOpacity
        testID="google-sign-in-button"
        style={[styles.googleButton, isExpoGo && { backgroundColor: "#ccc" }]}
        onPress={handleGoogleSignIn}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {isExpoGo ? "Native Login Hidden" : "Sign in with Google"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};