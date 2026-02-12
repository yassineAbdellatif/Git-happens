// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLon7RGE1LyvwAY7ht6IRlLaKGUsx-yCQ",
  authDomain: "soen390-565be.firebaseapp.com",
  projectId: "soen390-565be",
  storageBucket: "soen390-565be.firebasestorage.app",
  messagingSenderId: "332552903248",
  appId: "1:332552903248:web:78aaca8973ca99ef63cf55",
  measurementId: "G-6FVGSWPK9N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});