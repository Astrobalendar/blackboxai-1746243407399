// Usage: node firestore_patch_user_names.js
// This script patches all users in Firestore to ensure they have fullName and display_name fields.
// Run from the root of your monorepo: node scripts/firestore_patch_user_names.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // <-- Ensure this path points to your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function patchUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  let patched = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.fullName || data.display_name || data.name || data.firstName || '';
    if (!data.fullName || !data.display_name) {
      await doc.ref.update({
        fullName: name,
        display_name: name
      });
      patched++;
      console.log(`Patched user ${doc.id}: set fullName/display_name to '${name}'`);
    }
  }
  console.log(`\nPatched ${patched} user(s).`);
}

patchUsers().then(() => process.exit(0));
