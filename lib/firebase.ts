import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in anonymously on load
signInAnonymously(auth)
  .then(() => console.log("Anonymous sign-in successful"))
  .catch((err) => console.error("Anonymous sign-in error:", err));

// Optionally: Track auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Signed in as:", user.uid);
  }
});

export { db, auth };
