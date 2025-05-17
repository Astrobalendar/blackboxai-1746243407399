import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Security rules validation (client-side)
export const validateStoragePath = (path: string): boolean => {
  // Ensure the path is within the allowed patterns
  const allowedPatterns = [
    /^predictions\/\d+_\w+\.pdf$/i, // predictions/1234567890_filename.pdf
    /^users\/[\w-]+\/\w+\/\d+_\w+\.\w+$/i, // users/user-id/collection/1234567890_filename.ext
  ];

  return allowedPatterns.some(pattern => pattern.test(path));
};

// Helper to generate storage paths
export const getStoragePath = (userId: string, filename: string): string => {
  const timestamp = Date.now();
  const sanitizedFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_');
  
  return `users/${userId}/predictions/${timestamp}_${sanitizedFilename}`;
};
