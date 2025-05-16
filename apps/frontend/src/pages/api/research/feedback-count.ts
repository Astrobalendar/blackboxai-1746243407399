import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { verifyIdToken } from '../../lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    await verifyIdToken(token);
    const db = getFirestore();
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'Missing date range' });
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);
    // Query all records in all aiTrainingBatches where reviewedAt is today
    const snapshot = await db.collectionGroup('records')
      .where('reviewedAt', '>=', Timestamp.fromDate(fromDate))
      .where('reviewedAt', '<=', Timestamp.fromDate(toDate))
      .get();
    res.status(200).json({ count: snapshot.size });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
