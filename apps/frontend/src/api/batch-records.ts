import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

async function verifyFirebaseToken(authHeader?: string) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/batch-records?batchId=xxx
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyFirebaseToken(req.headers.authorization as string);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { batchId } = req.query;
    if (!batchId || typeof batchId !== 'string') return res.status(400).json({ error: 'Missing batchId' });
    const batchDoc = db.collection('aiTrainingBatches').doc(batchId);
    const recordsSnap = await batchDoc.collection('records').get();
    const records = recordsSnap.docs.map(doc => ({ recordId: doc.id, ...doc.data() }));
    res.status(200).json({ records });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
