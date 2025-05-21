// Firebase service for KP Astrology AI/ML Platform (Frontend)
// Robust, type-safe, modular, and production-ready

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth, type Auth, setPersistence, inMemoryPersistence, connectAuthEmulator
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

function getFirebaseConfig(): FirebaseOptions {
  validateFirebaseEnv();
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
}

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

// Optionally auto-initialize in browser
if (typeof window !== 'undefined') {
  firebaseService.initialize().catch(console.error);
}
