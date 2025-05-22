// Firebase Admin SDK initialization for SSR/API routes
import { initializeApp, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  credential: applicationDefault(),
  // Optionally provide projectId, storageBucket, etc. if needed
};

let adminApp;
if (!getApps().length) {
  adminApp = initializeApp(firebaseAdminConfig);
} else {
  adminApp = getApp();
}

export { adminApp };
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// Utility: Verify Firebase ID Token
export async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token);
}
