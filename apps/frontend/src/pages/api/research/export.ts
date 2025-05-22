import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import type { Query, Firestore as FirebaseFirestore } from 'firebase-admin/firestore';
import { verifyIdToken } from '@/lib/firebaseAdmin';
// @ts-expect-error: No type declarations for 'json2csv'
import { Parser as Json2csvParser } from 'json2csv'; // Ensure 'json2csv' is installed in your dependencies

function buildQuery(db: FirebaseFirestore, filters: any) {
  let query: Query = db.collectionGroup('records');
  if (filters.topic) query = query.where('topic', '==', filters.topic);
  if (filters.astrologer) query = query.where('astrologer', '==', filters.astrologer);
  if (filters.thumbs) query = query.where('thumbs', '==', filters.thumbs);
  if (filters.tags) query = query.where('tags', 'array-contains-any', filters.tags.split(','));
  if (filters.minConfidence) query = query.where('confidence', '>=', Number(filters.minConfidence));
  if (filters.maxConfidence) query = query.where('confidence', '<=', Number(filters.maxConfidence));
  return query;
}

const FIELDS = [
  'fullName', 'dob', 'pob', 'topic', 'aiPrediction', 'feedbackNote', 'thumbs', 'correction', 'markAsGold',
  'lastReviewedBy', 'reviewedAt', 'batchId', 'id', 'tags', 'confidence', 'astrologer'
];

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
    const format = (filters.format || 'csv').toString().toLowerCase();
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="astro_research_export.json"');
      res.status(200).send(JSON.stringify(records, null, 2));
    } else {
      // CSV
      const parser = new Json2csvParser({ fields: FIELDS });
      const csv = parser.parse(records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="astro_research_export.csv"');
      res.status(200).send(csv);
    }
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
