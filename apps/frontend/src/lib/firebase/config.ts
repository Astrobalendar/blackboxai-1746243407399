import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCM33icc6FOyDmhDwZXeW6CeWWeoNyWGqE",
  authDomain: "astrobalendar-2025-7505d.firebaseapp.com",
  projectId: "astrobalendar-2025-7505d",
  storageBucket: "astrobalendar-2025-7505d.firebasestorage.app",
  messagingSenderId: "213330379553",
  appId: "1:213330379553:web:659c209c1c35fe0849f460"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
