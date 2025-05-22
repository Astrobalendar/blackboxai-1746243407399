/* eslint-env node */
/* eslint-disable no-undef */
/* global require, module, process, console */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Firebase Admin SDK
const { db, auth } = require('./firebaseAdmin');

// KP prediction logic (stubbed for demonstration)
function getKPStructuredPrediction({ lagna, nakshatra }) {
  // Ruling Planets: based on lagna/nakshatra (sample logic)
  let rulingPlanets = [];
  if (lagna && nakshatra) {
    // Simple mapping for demonstration
    const lagnaMap = {
      Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
      Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
    };
    const nakshatraMap = {
      Ashwini: 'Ketu', Bharani: 'Venus', Krittika: 'Sun', Rohini: 'Moon', Mrigashirsha: 'Mars', Ardra: 'Rahu',
      Punarvasu: 'Jupiter', Pushya: 'Saturn', Ashlesha: 'Mercury', Magha: 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
      Hasta: 'Moon', Chitra: 'Mars', Swati: 'Rahu', Vishakha: 'Jupiter', Anuradha: 'Saturn', Jyeshta: 'Mercury',
      Mula: 'Ketu', 'Purva Ashadha': 'Venus', 'Uttara Ashadha': 'Sun', Shravana: 'Moon', Dhanishta: 'Mars', Shatabhisha: 'Rahu',
      'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', Revati: 'Mercury'
    };
    rulingPlanets = [lagnaMap[lagna] || lagna, nakshatraMap[nakshatra] || nakshatra, 'Venus'];
  } else {
    rulingPlanets = ['Sun', 'Moon', 'Mars'];
  }

  // Dasa Bhukti: static or simple period logic
  const dasaBhukti = [
    { period: 'Major', lord: 'Moon', start: '2020-01-01', end: '2030-01-01' },
    { period: 'Sub', lord: 'Saturn', start: '2024-01-01', end: '2025-12-31' }
  ];

  // Sublord Table: map 1-3 houses to sublords (stub)
  const sublordTable = [
    { house: '1', sublord: 'Ketu' },
    { house: '2', sublord: 'Venus' },
    { house: '3', sublord: 'Mars' }
  ];

  return { rulingPlanets, dasaBhukti, sublordTable };
}

// POST /api/predict
app.post('/api/predict', async (req, res) => {
  try {
    // Securely extract and verify Firebase ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Missing or invalid Authorization header' });
    }
    const idToken = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired ID token' });
    }
    const uid = decoded.uid;

    const { lagna, nakshatra } = req.body;
    // Validation
    if (!lagna || !nakshatra) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    // KP prediction
    const prediction = getKPStructuredPrediction({ lagna, nakshatra });
    // Save to Firestore under users/{uid}/horoscopes
    const docRef = db.collection('users').doc(uid).collection('horoscopes').doc();
    const toSave = {
      lagna,
      nakshatra,
      ...prediction,
      createdAt: new Date().toISOString()
    };
    await docRef.set(toSave);
    res.json({ status: 'success', ...prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred while processing your request' });
  }
});

// Server listen (for local dev)
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`KP Backend running on port ${PORT}`));
}

module.exports = app;
