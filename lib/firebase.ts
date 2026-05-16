import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables.");
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export const firebaseApp = isFirebaseConfigured() ? getFirebaseApp() : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null;
