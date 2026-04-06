import Constants from "expo-constants";

const isExpoGo = Constants.executionEnvironment === "storeClient";

/**
 * Silently refreshes google OAuth access token using the native Google Sign-In SDK
 * Returns a fresh access token or null if refresh fails.
 */
export const refreshGoogleAccessToken = async (): Promise<string | null> => {
  if (isExpoGo) {
    return null;
  }

  try {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken ?? null;
  } catch (error) {
    console.warn("[googleTokenService] Failed to refresh access token:", error);
    return null;
  }
};