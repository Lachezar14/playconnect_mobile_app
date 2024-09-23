// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, initializeAuth, getReactNativePersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkK8O6nQy3LKWJrdeC29e5W0NYUMcY9F0",
  authDomain: "playconnect-c2329.firebaseapp.com",
  projectId: "playconnect-c2329",
  storageBucket: "playconnect-c2329.appspot.com",
  messagingSenderId: "922721463640",
  appId: "1:922721463640:web:25dbbb004ced3255f0892d",
  measurementId: "G-CVFE9MVH0J"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
const analytics = getAnalytics(FIREBASE_APP);