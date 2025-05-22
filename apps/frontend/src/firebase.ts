// Firebase service for KP Astrology AI/ML Platform (Frontend)
// Robust, type-safe, modular, and production-ready
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth, type Auth, setPersistence, inMemoryPersistence, connectAuthEmulator,
  GoogleAuthProvider, signInWithPopup, OAuthProvider
} from 'firebase/auth';
import {
  getFirestore, type Firestore, connectFirestoreEmulator, enableIndexedDbPersistence, FirestoreError
} from 'firebase/firestore';
import {
  getStorage, type FirebaseStorage, connectStorageEmulator
} from 'firebase/storage';

// Helper: Validate required Vite env vars
function validateFirebaseEnv() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  for (const key of required) {
    if (!import.meta.env[key]) {
      throw new Error(`Missing Firebase env variable: ${key}`);
    }
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCM33icc6FOyDmhDwZXeW6CeWWeoNyWGqE",
  authDomain: "astrobalendar-2025-7505d.firebaseapp.com",
  projectId: "astrobalendar-2025-7505d",
  storageBucket: "astrobalendar-2025-7505d.firebasestorage.app",
  messagingSenderId: "213330379553",
  appId: "1:213330379553:web:659c209c1c35fe0849f460",
  measurementId: "G-R9K5Q043T3"
};

class FirebaseService {
  private static _instance: FirebaseService;
  private _app: FirebaseApp | null = null;
  private _auth: Auth | null = null;
  private _db: Firestore | null = null;
  private _storage: FirebaseStorage | null = null;
  private _isInitialized = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService._instance) {
      FirebaseService._instance = new FirebaseService();
    }
    return FirebaseService._instance;
  }

  public async initialize(): Promise<void> {
    if (this._isInitialized) return;
    // Initialize app
    this._app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
    // Auth
    this._auth = getAuth(this._app);
    await setPersistence(this._auth, inMemoryPersistence);
    // Firestore
    this._db = getFirestore(this._app);
    // Storage
    this._storage = getStorage(this._app);
    // Emulator support (DEV only)
    if (import.meta.env.DEV) {
      connectAuthEmulator(this._auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(this._db, 'localhost', 8080);
      connectStorageEmulator(this._storage, 'localhost', 9199);
    }
    // Enable offline persistence (browser only)
    if (typeof window !== 'undefined') {
      try {
        await enableIndexedDbPersistence(this._db!);
      } catch (err) {
        const error = err as FirestoreError;
        if (error.code === 'failed-precondition') {
          console.warn('Firestore persistence can only be enabled in one tab at a time.');
        } else if (error.code === 'unimplemented') {
          console.warn('Current browser does not support all features required for persistence.');
        } else {
          console.error('Error enabling Firestore persistence:', error.message);
        }
      }
    }
    this._isInitialized = true;
    console.log('✅ Firebase initialized');
  }

  // Public getters
  get app(): FirebaseApp {
    if (!this._app) throw new Error('Firebase not initialized');
    return this._app;
  }
  get auth(): Auth {
    if (!this._auth) throw new Error('Auth not initialized');
    return this._auth;
  }
  get db(): Firestore {
    if (!this._db) throw new Error('Firestore not initialized');
    return this._db;
  }
  get storage(): FirebaseStorage {
    if (!this._storage) throw new Error('Storage not initialized');
    return this._storage;
  }
  get isInitialized(): boolean {
    return this._isInitialized;
  }
}

// Export singleton
export const firebaseService = FirebaseService.getInstance();

// Safe getters for Firebase Auth and Firestore
export function getAuthSafe() {
  if (!firebaseService.isInitialized) throw new Error('Firebase not initialized');
  return getAuth(firebaseService.app);
}

export function getDbSafe() {
  if (!firebaseService.isInitialized) throw new Error('Firebase not initialized');
  return getFirestore(firebaseService.app);
}

// Optionally auto-initialize in browser
if (typeof window !== 'undefined') {
  firebaseService.initialize().catch(console.error);
}

// --- Social Auth Helpers ---
export async function signInWithGoogle() {
  const auth = getAuthSafe();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signInWithApple() {
  const auth = getAuthSafe();
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}
