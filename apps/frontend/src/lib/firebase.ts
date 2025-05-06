import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM33icc6FOyDmhDwZXeW6CeWWeoNyWGqE",
  authDomain: "astrobalendar-2025-7505d.firebaseapp.com",
  projectId: "astrobalendar-2025-7505d",
  storageBucket: "astrobalendar-2025-7505d.firebasestorage.app",
  messagingSenderId: "213330379553",
  appId: "1:213330379553:web:348f60e70f26e32049f460",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous Auth Error:", error);
});

export { db, auth };
