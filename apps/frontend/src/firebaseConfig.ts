import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCM33icc6FOyDmhDwZXeW6CeWWeoNyWGqE",
  authDomain: "astrobalendar-2025-7505d.firebaseapp.com",
  projectId: "astrobalendar-2025-7505d",
  storageBucket: "astrobalendar-2025-7505d.firebasestorage.app",
  messagingSenderId: "213330379553",
  appId: "1:213330379553:web:659c209c1c35fe0849f460"
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
