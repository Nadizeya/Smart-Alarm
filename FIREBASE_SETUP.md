# Firebase Setup Walkthrough — Smart Alarm

This guide documents how Firebase is integrated into your Smart Alarm app and how to manage it going forward.
The `firebase` JS SDK (v12) is used — fully compatible with Expo managed workflow, no native build needed.

---

## What Was Already Done For You

| Step | File | Description |
|---|---|---|
| Install SDK | `package.json` | `firebase` package added via `npx expo install firebase` |
| Config file | `config/firebase.ts` | Initialises Firebase app, Auth (`getAuth`), and Firestore (`getFirestore`) |
| Auth hook | `hooks/useAuth.tsx` | Replaced mock auth with real Firebase Authentication |

---

## Current Firebase Config (`config/firebase.ts`)

Your Firebase project credentials are already set directly in the config file.

```ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",        // ← already set to your project
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);   // Firebase Authentication
export const db   = getFirestore(app); // Firestore database
export default app;
```

> **Security tip:** If you plan to commit this project to a public repository, move the credentials
> to a `.env` file (see [Securing Credentials](#optional--securing-credentials-with-env)) and add
> `.env` to `.gitignore`.

---

## Step 1 — Enable Email/Password Authentication

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and open your project (`smart-alarm-bef73`).
2. Navigate to **Authentication → Sign-in method**.
3. Click **Email/Password**, toggle it **Enabled**, and save.
4. Go to **Authentication → Users** and **Add user** with the email/password your app will use to log in.

---

## Step 2 — Run and Test

```bash
npx expo start
```

Log in with the user you created above. The `onAuthStateChanged` listener in `useAuth.tsx` will automatically update `isAuthenticated` when a user signs in or out.

> **Note on session persistence:** Firebase 12's `getAuth()` uses **in-memory** persistence on React Native.
> This means the user will need to log in again after fully closing and restarting the app.
> See [Enabling Persistent Sessions](#optional--enabling-persistent-sessions) below if you want to avoid this.

---

## Optional — Enabling Persistent Sessions

To keep the user logged in across app restarts, call `setPersistence` (not available for React Native natively), or store a custom token in `AsyncStorage`. The simplest approach is to save/restore a Firebase custom token:

```ts
// Alternative: persist the user's ID token yourself
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    await AsyncStorage.setItem("@firebase_token", token);
  } else {
    await AsyncStorage.removeItem("@firebase_token");
  }
});
```

---

## Optional — Securing Credentials with .env

If committing to a public repository, move the values to a `.env` file:

```bash
# .env  (add this file to .gitignore)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=smart-alarm-bef73.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=smart-alarm-bef73
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=smart-alarm-bef73.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=489494477879
EXPO_PUBLIC_FIREBASE_APP_ID=1:489494477879:web:...
```

Then update `config/firebase.ts` to read from `process.env`:

```ts
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
```

Keep a `.env.example` with placeholder values so other developers know what to fill in.

---

## Project File Reference

### `config/firebase.ts`
Single source of truth for Firebase. Exports:
- `auth` — Firebase Auth instance
- `db` — Firestore database instance
- `default` — the Firebase app instance

### `hooks/useAuth.tsx`
React context wrapping Firebase Auth. Exposes:

| Property | Type | Description |
|---|---|---|
| `isAuthenticated` | `boolean` | `true` when a user is signed in |
| `isLoading` | `boolean` | `true` while verifying auth state on startup |
| `user` | `User \| null` | Full Firebase `User` object (uid, email, displayName, etc.) |
| `login(email, password)` | `Promise<boolean>` | Signs in with Firebase, returns `false` on error |
| `logout()` | `Promise<void>` | Signs out the current user |
| `checkAuth()` | `Promise<void>` | No-op (kept for backward compatibility with existing screens) |

---

## Optional — Using Firestore for Alarms

`db` is already exported from `config/firebase.ts`. Example — save and read alarms:

```ts
import { db, auth } from "@/config/firebase";
import {
  collection, addDoc, getDocs, serverTimestamp, query, orderBy,
} from "firebase/firestore";

// Save a new alarm
export const saveAlarm = async (time: string, label: string) => {
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(collection(db, "users", user.uid, "alarms"), {
    time,
    label,
    createdAt: serverTimestamp(),
  });
};

// Load all alarms
export const loadAlarms = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(
    collection(db, "users", user.uid, "alarms"),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
```

---

## Optional — Firestore Security Rules

In Firebase Console → **Firestore → Rules**, restrict access so users can only read/write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `auth/invalid-api-key` | Check the `apiKey` value in `config/firebase.ts` (or your `.env`) |
| `auth/user-not-found` or `auth/wrong-password` | Create the user in Firebase Console → Authentication → Users |
| `auth/configuration-not-found` | Enable Email/Password sign-in in Firebase Console |
| `auth/network-request-failed` | Check internet connection; also verify `authDomain` is correct |
| `Cannot find module '@/config/firebase'` | Ensure `config/firebase.ts` exists; `tsconfig.json` already has `"@/*": ["./*"]` |
| User logged out on every app restart | Expected with `getAuth()` default; see [Enabling Persistent Sessions](#optional--enabling-persistent-sessions) |

