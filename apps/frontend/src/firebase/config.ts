import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string || undefined,
};

// Initialize Firebase
let app: FirebaseApp;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase');
}

// Initialize services
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase service initialization error:', error);
  throw new Error('Failed to initialize Firebase services');
}

export { app, auth, db, storage };
export type { FirebaseApp, Auth, Firestore, FirebaseStorage };

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
