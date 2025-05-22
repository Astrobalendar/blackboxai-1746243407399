// Firebase Admin/Client Initialization for Astrobalendar
// This file should be imported using the @/lib/firebase alias throughout the frontend

import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCM33icc6FOyDmhDwZXeW6CeWWeoNyWGqE",
  authDomain: "astrobalendar-2025-7505d.firebaseapp.com",
  projectId: "astrobalendar-2025-7505d",
  storageBucket: "astrobalendar-2025-7505d.appspot.com",
  messagingSenderId: "213330379553",
  appId: "1:213330379553:web:659c209c1c35fe0849f460",
  measurementId: "G-R9K5Q043T3"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export { app };
export const auth = getAuth(app);

// Example utility: verifyIdToken (for SSR or API routes, needs admin SDK in backend)
// export async function verifyIdToken(token: string): Promise<any> {
//   // Implement using firebase-admin if needed (backend only)
// }
