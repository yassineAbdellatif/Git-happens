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

const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  const GSignin = require("@react-native-google-signin/google-signin");
  GoogleSignin = GSignin.GoogleSignin;
  statusCodes = GSignin.statusCodes;

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,

    offlineAccess: false,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
}

export const LoginScreen = ({ navigation }: any) => {
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
      // Force sign out to clear any cached sessions without the calendar scope
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log("User was not signed in, proceeding to sign in...");
      }

      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;

      if (!idToken) {
        console.error(
          "DEBUG - Full Google Sign-In Response (Missing ID Token):",
          response,
        );

        throw new Error("No ID Token found");
      }

      // Explicitly request the access token
      const tokens = await GoogleSignin.getTokens();
      console.log("DEBUG - Raw tokens object retrieved:", tokens);

      if (tokens.accessToken) {
        console.log(
          "DEBUG - SUCCESS! Calendar Access Token:",
          tokens.accessToken,
        );

        setGoogleCalendarAccessToken(tokens.accessToken);
        console.log("Calendar Token successfully saved to context!");
      } else {
        console.warn(
          "DEBUG - Warning: getTokens() fired, but 'accessToken' was undefined.",
        );
      }

      // Proceed with Firebase Auth
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      console.log(
        "Google Sign-In successful for Firebase user:",
        result.user.displayName,
      );
    } catch (error: any) {
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
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
