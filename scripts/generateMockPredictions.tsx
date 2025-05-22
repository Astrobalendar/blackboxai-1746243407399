#!/usr/bin/env ts-node
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA SOURCES ---
const names = [
  'Aarav Sharma', 'Vivaan Patel', 'Diya Singh', 'Anaya Reddy', 'Kabir Das',
  'Meera Iyer', 'Ishaan Gupta', 'Saanvi Joshi', 'Aryan Nair', 'Myra Rao',
  'Rohan Jain', 'Advika Shah', 'Reyansh Mehta', 'Aadhya Kapoor', 'Arjun Verma'
];
const pobs = [
  { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { city: 'Delhi', lat: 28.6139, lng: 77.209 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { city: 'Hyderabad', lat: 17.385, lng: 78.4867 }
];
const genders = ['male', 'female', 'other'];
const topics = ['Career', 'Health', 'Finance', 'Relationships', 'Spirituality'];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// --- MAIN SCRIPT ---
(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option('uid', { type: 'string', demandOption: true, describe: 'Astrologer UID' })
    .option('count', { type: 'number', default: 10, describe: 'Number of mock horoscopes to generate' })
    .help().argv;

  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();

  for (let i = 0; i < argv.count; i++) {
    const fullName = randomFrom(names);
    const dob = randomDate(new Date(1980, 0, 1), new Date(2005, 11, 31));
    const tob = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const pob = randomFrom(pobs);
    const gender = randomFrom(genders);
    const horoscopeId = uuidv4();
    // Mock chart data
    const chartData = {
      lagna: randomFrom(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']),
      sublords: Array.from({ length: 9 }, () => randomFrom(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'])),
      dasaStart: randomDate(new Date(2000, 0, 1), new Date(2025, 11, 31)),
      planets: Array.from({ length: 9 }, () => ({
        name: randomFrom(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']),
        degree: +(Math.random() * 30).toFixed(2)
      }))
    };
    // Write to users/{uid}/horoscopes/{horoscopeId}
    await db.collection('users').doc(argv.uid)
      .collection('horoscopes').doc(horoscopeId).set({
        fullName,
        dob: dob.toISOString().slice(0, 10),
        tob,
        pob: pob.city,
        lat: pob.lat,
        lng: pob.lng,
        gender,
        chartData,
        astrologerId: argv.uid,
        createdAt: FieldValue.serverTimestamp(),
      });
    // Write predictions/{horoscopeId}/topics/{topicKey}
    for (const topic of topics) {
      const confidence = +(Math.random() * 1).toFixed(2);
      await db.collection('predictions').doc(horoscopeId)
        .collection('topics').doc(topic.toLowerCase()).set({
          topic,
          notes: `AI prediction for ${topic.toLowerCase()}...`,
          confidence,
          markAsGold: Math.random() > 0.8,
          thumbs: randomFrom(['up', 'down', null]),
          correction: Math.random() > 0.9 ? 'Correction note' : '',
          feedbackNote: Math.random() > 0.7 ? 'Astrologer feedback' : '',
          astrologerId: argv.uid,
          createdAt: FieldValue.serverTimestamp(),
          reviewedAt: FieldValue.serverTimestamp(),
        });
    }
    console.log(`Mock horoscope ${i + 1}/${argv.count} created: ${fullName} (${horoscopeId})`);
  }
  console.log('✅ Mock prediction generation complete.');
})();
