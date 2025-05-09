import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.send('AstroBalendar backend is up!'));

// Mock prediction endpoint
app.post('/predict', async (req, res) => {
  // TODO: Replace with real KP logic
  const { name, dateOfBirth, timeOfBirth, location } = req.body;
  if (!name || !dateOfBirth || !timeOfBirth || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Simulate prediction result
  res.json({
    kpChart: {
      rasi: [],
      lagna: 'Aries',
      nakshatra: 'Ashwini',
      dasa: 'Venus',
      bhukti: 'Mercury',
      planetaryPositions: [],
      houses: [],
      significators: []
    },
    message: 'This is a mock prediction. KP logic to be implemented.'
  });
});

// User registration (store user + birth data)
app.post('/register', async (req, res) => {
  const { uid, role, name, email, mobile, birthData } = req.body;
  if (!uid || !role || !name || !email || !mobile || !birthData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  await db.collection('users').doc(uid).set({
    role, name, email, mobile, birthData, createdAt: new Date().toISOString()
  }, { merge: true });
  res.json({ success: true });
});

// Location data (mock for now)
app.get('/locations', (req, res) => {
  // TODO: Replace with real location DB or Google Maps API
  res.json({
    countries: ['India'],
    states: ['Tamil Nadu', 'Karnataka'],
    districts: ['Arcot', 'Chennai', 'Bangalore Urban'],
    cities: ['Vellore', 'Chennai', 'Bangalore']
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
