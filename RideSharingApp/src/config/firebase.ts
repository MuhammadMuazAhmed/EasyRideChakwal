import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { env } from './env';

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
