import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDyo5s3mAmSzMtoahKAQd0SWEDRw1XV3Vc",
  authDomain: "workandtravel-8951a.firebaseapp.com",
  projectId: "workandtravel-8951a",
  storageBucket: "workandtravel-8951a.appspot.com",
  messagingSenderId: "198555043035",
  appId: "1:198555043035:web:e6648d331bd035c22f38fe",
  measurementId: "G-GVKE4HS1DQ",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firestore Database
const db = getFirestore(app);

// Firebase Authentication with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { db, auth }; // Экспорт db и auth
