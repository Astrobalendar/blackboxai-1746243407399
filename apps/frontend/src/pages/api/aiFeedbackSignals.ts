import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)),
  });
}

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const {
      recordId,
      topicKey,
      feedbackNote,
      confidence,
      correction,
      thumbs,
      markAsGold,
      uid,
      sourceSessionId,
      originalPredictionHash
    } = req.body;
    if (!recordId || !topicKey || typeof thumbs !== 'string' || typeof confidence !== 'number' || !uid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const now = Date.now();
    await db.collection('aiFeedbackSignals').doc(recordId).set({
      recordId,
      topicKey,
      feedbackNote: feedbackNote || '',
      confidence,
      correction: correction || '',
      thumbs,
      markAsGold: !!markAsGold,
      annotatedBy: uid,
      timestamp: now,
      sourceSessionId: sourceSessionId || '',
      originalPredictionHash: originalPredictionHash || '',
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
