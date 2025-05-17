import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin if not already
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Checks for duplicate horoscope by fullName + dateOfBirth
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { fullName, dateOfBirth } = req.body;
  if (!fullName || !dateOfBirth) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const snapshot = await db
      .collection('horoscopes')
      .where('fullName', '==', fullName)
      .where('dateOfBirth', '==', dateOfBirth)
      .limit(1)
      .get();
    if (!snapshot.empty) {
      return res.status(200).json({ duplicate: true });
    }
    return res.status(200).json({ duplicate: false });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
