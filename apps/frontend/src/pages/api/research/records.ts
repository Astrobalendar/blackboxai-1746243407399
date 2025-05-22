import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyIdToken } from '../../lib/firebase';

// Helper: Build Firestore query with filters
import type { Firestore, Query } from 'firebase-admin/firestore';

function buildQuery(db: Firestore, filters: any) {
  let query: Query = db.collectionGroup('records');
  if (filters.topic) query = query.where('topic', '==', filters.topic);
  if (filters.astrologer) query = query.where('astrologer', '==', filters.astrologer);
  if (filters.thumbs) query = query.where('thumbs', '==', filters.thumbs);
  if (filters.tags) query = query.where('tags', 'array-contains-any', filters.tags.split(','));
  if (filters.minConfidence) query = query.where('confidence', '>=', Number(filters.minConfidence));
  if (filters.maxConfidence) query = query.where('confidence', '<=', Number(filters.maxConfidence));
  return query;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    await verifyIdToken(token);
    const db = getFirestore();
    const filters = req.query;
    const query = buildQuery(db, filters);
    const snapshot = await query.get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
