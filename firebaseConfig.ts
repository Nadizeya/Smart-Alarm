import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6voDFbr6zdeA44PwsctjzStYHVZwGTXA",
  authDomain: "smart-alarm-bef73.firebaseapp.com",
  projectId: "smart-alarm-bef73",
  storageBucket: "smart-alarm-bef73.firebasestorage.app",
  messagingSenderId: "489494477879",
  appId: "1:489494477879:web:48e52495e64a0963d5d3b2",
  measurementId: "G-ZQ3DYMEB0Z",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, auth };
