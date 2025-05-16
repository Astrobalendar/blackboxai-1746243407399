import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await verifyFirebaseToken(req.headers.authorization as string);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const isAdmin = user.role === 'admin' || user.admin === true;
    const limit = 25;
    const {
      dateFrom,
      dateTo,
      astrologer,
      fileType,
      cursor,
    } = req.query;

    let query = db.collection('aiTrainingBatches') as FirebaseFirestore.Query;
    if (!isAdmin) {
      query = query.where('uploadedBy', '==', user.uid);
    }
    if (dateFrom) {
      query = query.where('timestamp', '>=', new Date(dateFrom as string));
    }
    if (dateTo) {
      query = query.where('timestamp', '<=', new Date(dateTo as string));
    }
    if (astrologer) {
      query = query.where('createdBy', '==', astrologer);
    }
    if (fileType) {
      query = query.where('fileType', '==', fileType);
    }
    query = query.orderBy('timestamp', 'desc');
    if (cursor) {
      query = query.startAfter(new Date(cursor as string));
    }
    query = query.limit(limit);

    const snapshot = await query.get();
    const batches = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        batchId: doc.id,
        uploaded: d.uploaded,
        failed: d.failed,
        duplicates: d.duplicates,
        uploadedBy: d.uploadedBy,
        createdBy: d.createdBy,
        timestamp: d.timestamp instanceof Date ? d.timestamp : d.timestamp?.toDate?.() || '',
        fileType: d.fileType || '',
      };
    });
    res.status(200).json({
      batches,
      page: 1,
      total: batches.length,
      nextCursor: batches.length === limit ? batches[batches.length - 1]?.timestamp : null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
}
