// lib/firebase.ts
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const isRunningInExpoGo = Constants.appOwnership === "expo";

// Only initialize Firebase once (important for web hot reload)
const firebaseConfig = isRunningInExpoGo
  ? {
      apiKey: "AIzaSyBuqSMtc1m1l0iGh19CakVvPXNzs-4JTFI",
      authDomain: "learnus-c408d.firebaseapp.com",
      projectId: "learnus-c408d",
      storageBucket: "learnus-c408d.appspot.com",
      messagingSenderId: "421199311744",
      appId: "1:421199311744:web:fa38347010a37cf5bd0765",
      measurementId: "G-4HHPWLZJ0V",
    }
  : {
      apiKey: "AIzaSyD9s6JfKzwqqtU5FEo1Rv2XusaFwXQEQbg",
      authDomain: "learnus-c408d.firebaseapp.com",
      projectId: "learnus-c408d",
      storageBucket: "learnus-c408d.appspot.com",
      messagingSenderId: "421199311744",
      appId: "1:421199311744:android:9cabc9ff3871581fbd0765",
    };

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
