import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { v4 as uuidv4 } from 'uuid';
import { parse as json2csv } from 'json2csv';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

async function fetchAllFeedback() {
  const snap = await db.collection('aiFeedbackSignals').get();
  return snap.docs.map(doc => doc.data());
}

async function fetchPrediction(horoscopeId: string, topicKey: string) {
  try {
    const doc = await db.doc(`predictions/${horoscopeId}/topics/${topicKey}`).get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const batchId = uuidv4();
    const feedbacks = await fetchAllFeedback();
    const dataset: any[] = [];
    let recordCount = 0;

    for (const fb of feedbacks) {
      const { topicKey, sourceSessionId, correction, confidence, thumbs, markAsGold, annotatedBy, originalPredictionHash } = fb;
      // Assume sourceSessionId maps to horoscopeId (adjust as needed)
      const horoscopeId = sourceSessionId;
      const prediction = await fetchPrediction(horoscopeId, topicKey);
      if (!prediction) continue;
      dataset.push({
        prompt: prediction.prompt || '',
        completion: prediction.completion || '',
        topic: topicKey,
        confidence: confidence || 0,
        goldFlag: !!markAsGold,
        correction: correction || '',
      });
      recordCount++;
    }

    // Export JSONL
    const jsonlData = dataset.map(row => JSON.stringify(row)).join('\n');
    const jsonlPath = `aiTrainingBatches/${batchId}/export.jsonl`;
    await bucket.file(jsonlPath).save(jsonlData, { contentType: 'application/jsonl' });

    // Export CSV
    const csv = json2csv(dataset, { fields: ['prompt', 'completion', 'topic', 'confidence', 'goldFlag', 'correction'] });
    const csvPath = `aiTrainingBatches/${batchId}/export.csv`;
    await bucket.file(csvPath).save(csv, { contentType: 'text/csv' });

    // Log checkpoint
    const checkpoint = {
      batchId,
      recordCount,
      createdAt: Date.now(),
      triggeredBy: req.body.uid || 'system',
      datasetPathJsonl: jsonlPath,
      datasetPathCsv: csvPath,
      modelNotes: req.body.modelNotes || '',
    };
    const versionId = batchId;
    await db.collection('aiModelCheckpoints').doc(versionId).set(checkpoint);

    // Log trigger
    await db.collection(`aiTrainingBatches/${batchId}/triggerLogs`).add({
      status: 'success',
      responseCode: 200,
      notes: 'Retrain completed',
      recordCount,
      timestamp: Date.now(),
    });

    return res.status(200).json({ ...checkpoint, jsonlUrl: jsonlPath, csvUrl: csvPath });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
