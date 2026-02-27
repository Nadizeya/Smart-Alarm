import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase project config — replace values with your actual project's config
// from Firebase Console → Project Settings → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6voDFbr6zdeA44PwsctjzStYHVZwGTXA",
  authDomain: "smart-alarm-bef73.firebaseapp.com",
  projectId: "smart-alarm-bef73",
  storageBucket: "smart-alarm-bef73.firebasestorage.app",
  messagingSenderId: "489494477879",
  appId: "1:489494477879:web:48e52495e64a0963d5d3b2",
  measurementId: "G-ZQ3DYMEB0Z"
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth — uses platform-default persistence
// (indexedDB on web, in-memory on native; session survives hot reload)
export const auth = getAuth(app);

// Firestore database (ready to use)
export const db = getFirestore(app);

export default app;
