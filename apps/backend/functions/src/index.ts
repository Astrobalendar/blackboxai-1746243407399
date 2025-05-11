import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// NOTE: Function name changed from 'api' to 'astroApi' to avoid Cloud Run name conflict.

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
    role,
    name,
    fullName: name,
    display_name: name,
    email,
    mobile,
    birthData,
    createdAt: new Date().toISOString()
  }, { merge: true });
  res.json({ success: true });
});

// Location data (standardized list)
app.get('/locations', (req, res) => {
  res.json({
    locations: [
      { name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
      { name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
      { name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
      { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
      { name: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
      { name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
      { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
      { name: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
      { name: 'Chittoor', state: 'Andhra Pradesh', latitude: 13.2172, longitude: 79.1000 },
      { name: 'Sholinghur', state: 'Tamil Nadu', latitude: 12.9501, longitude: 80.1636 }
    ]
  });
});

// Export the Express API as a single Cloud Function
exports.astroApi = functions.https.onRequest(app);
