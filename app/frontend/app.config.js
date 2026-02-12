export default {
  expo: {
    name: "Campus Guide", // Changed for better UI appearance
    slug: "frontend",
    version: "1.0.0",
    scheme: "campus-guide",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.githappens",
      // Best practice: Path to your Firebase config file
      googleServicesFile: "./GoogleService-Info.plist", 
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: "com.githappens",
      // Best practice: Path to your Firebase config file
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-web-browser",
      [
        "@react-native-google-signin/google-signin",
        {
          // Replace this with your REVERSED_CLIENT_ID from GoogleService-Info.plist
          iosUrlScheme: "com.googleusercontent.apps.332552903248-vb70apsfbeof7en4l4i5tbkn75ifr6nc"
        }
      ]
    ],
  },
};