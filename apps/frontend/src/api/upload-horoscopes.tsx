import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import formidable, { File as FormFile } from 'formidable';
import { parseCSV, parseXLSX, parseJSON, parseZIP } from '../../utils/parsers';
import { recordHash } from '../../utils/hash';
// If you still get TS errors, try:
// import { parseCSV, parseXLSX, parseJSON, parseZIP } from '../../utils/parsers.ts';
// import { recordHash } from '../../utils/hash.ts';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const RATE_LIMIT = 3; // per hour
const REQUIRED_FIELDS = ['fullName', 'dob', 'tob', 'pob', 'prediction'];

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: MAX_SIZE, multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function bufferFromFile(file: FormFile): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = require('fs').createReadStream(file.filepath);
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Auth check
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!decoded || !['admin', 'astrologer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const userId = decoded.uid;

    // Rate limit (Firestore-based, simple)
    const db = getFirestore();
    const now = Date.now();
    const rateRef = db.collection('users').doc(userId).collection('rateLimits').doc('batchUploads');
    const rateSnap = await rateRef.get();
    let uploads = 0;
    if (rateSnap.exists) {
      const data = rateSnap.data();
      if (data && data.lastHour && data.lastHour > now - 60 * 60 * 1000) {
        uploads = data.count || 0;
      }
    }
    if (uploads >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Rate limit exceeded (3 uploads/hour)' });
    }
    await rateRef.set({ lastHour: now, count: uploads + 1 }, { merge: true });

    // Parse form
    const { fields, files } = await parseForm(req);
    const batchLabel = fields.batchLabel || '';
    const file: FormFile = files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (file.size > MAX_SIZE) return res.status(413).json({ error: 'File too large' });
    const ext = file.originalFilename?.split('.').pop()?.toLowerCase();
    const buf = await bufferFromFile(file);

    // Parse file
    let rows: any[] = [];
    if (ext === 'csv') rows = await parseCSV(buf);
    else if (ext === 'xlsx') rows = await parseXLSX(buf);
    else if (ext === 'json') rows = await parseJSON(buf);
    else if (ext === 'zip') rows = await parseZIP(buf);
    else return res.status(400).json({ error: 'Unsupported file type' });

    // Validate & deduplicate
    const batchId = batchLabel ? batchLabel : `batch-${now}`;
    const batchRef = db.collection('aiTrainingBatches').doc(batchId);
    const recordsRef = batchRef.collection('records');
    const seen = new Set<string>();
    const existingHashes: Set<string> = new Set();
    // Fetch all existing record hashes for dedup
    const snapshot = await recordsRef.get();
    snapshot.forEach(doc => existingHashes.add(doc.id));

    const summary: any[] = [];
    let uploaded = 0, duplicates = 0, failed = 0;
    for (let i = 0; i < rows.length; ++i) {
      const row = rows[i];
      // Validation
      const missing = REQUIRED_FIELDS.filter(f => !row[f] || row[f] === '');
      if (missing.length) {
        summary.push({ rowIndex: i, status: 'failed', message: `Missing fields: ${missing.join(', ')}` });
        failed++;
        continue;
      }
      // Deduplication
      const hash = recordHash(row.fullName, row.dob, row.tob, row.pob);
      if (seen.has(hash) || existingHashes.has(hash)) {
        summary.push({ rowIndex: i, status: 'duplicate', message: 'Duplicate entry' });
        duplicates++;
        continue;
      }
      seen.add(hash);
      // Write to Firestore
      try {
        await recordsRef.doc(hash).set({
          ...row,
          aiSegmented: false,
          createdAt: FieldValue.serverTimestamp(),
        });
        uploaded++;
        summary.push({ rowIndex: i, status: 'uploaded', message: 'Success' });
      } catch (e) {
        summary.push({ rowIndex: i, status: 'failed', message: 'Firestore error' });
        failed++;
      }
    }
    // Write batch meta
    await batchRef.set({
      createdBy: userId,
      total: rows.length,
      uploaded,
      failed,
      timestamp: FieldValue.serverTimestamp(),
    }, { merge: true });
    res.json({ uploaded, duplicates, failed, records: summary });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}

export default handler;
