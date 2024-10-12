// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, initializeAuth, getReactNativePersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig_dev = {
  apiKey: "AIzaSyBkK8O6nQy3LKWJrdeC29e5W0NYUMcY9F0",
  authDomain: "playconnect-c2329.firebaseapp.com",
  projectId: "playconnect-c2329",
  storageBucket: "playconnect-c2329.appspot.com",
  messagingSenderId: "922721463640",
  appId: "1:922721463640:web:25dbbb004ced3255f0892d",
  measurementId: "G-CVFE9MVH0J"
};

const firebaseConfig_prod = {
  apiKey: "AIzaSyAJm94D2L2R9mRvYIhiOd0XkqzLuTUeeis",
  authDomain: "playconnect-prod.firebaseapp.com",
  projectId: "playconnect-prod",
  storageBucket: "playconnect-prod.appspot.com",
  messagingSenderId: "488147937021",
  appId: "1:488147937021:web:ffdb49940d29360f1f4094",
  measurementId: "G-HSLYENKK3Y"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig_dev);
//export const FIREBASE_APP = initializeApp(firebaseConfig_prod);

// Initialize Auth with AsyncStorage persistence
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
//const analytics = getAnalytics(FIREBASE_APP);