/* eslint-env node */
// apps/backend/firebaseAdmin.js
/* eslint-disable no-undef */
/* global require, module */

const admin = require('firebase-admin');

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Optionally, add databaseURL if needed
    // databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
