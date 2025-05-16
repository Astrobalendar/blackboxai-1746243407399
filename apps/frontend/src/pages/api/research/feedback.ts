import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { verifyIdToken } from '../../lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const user = await verifyIdToken(token);
    const { recordId, batchId, field, value } = req.body;
    if (!recordId || !batchId || !field) return res.status(400).json({ error: 'Missing params' });
    const db = getFirestore();
    const ref = db.collection('aiTrainingBatches').doc(batchId).collection('records').doc(recordId);
    const update: any = {
      [field]: value,
      lastReviewedBy: user.uid,
      reviewedAt: FieldValue.serverTimestamp(),
    };
    await ref.update(update);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
