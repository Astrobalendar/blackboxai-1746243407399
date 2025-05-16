import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { v4 as uuidv4 } from 'uuid';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)),
  });
}

const db = getFirestore();

// Dummy LLM call (replace with OpenAI or your LLM provider)
async function callLLM({ prompt, context }: { prompt: string; context: any }) {
  // TODO: Integrate with OpenAI API or other LLM provider
  // This is a placeholder for demonstration
  return `AI Response for: ${prompt} (context: ${JSON.stringify(context)})`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, message, user, role, chartContext, dasaContext, predictionContext } = req.body;
    if (!sessionId || !message || !user || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const aiPrompt = `You are a ${role === 'astrologer' ? 'KP astrologer' : 'client assistant'} answering astrology questions.\nUser: ${message}`;
    const context = { chart: chartContext, dasa: dasaContext, predictions: predictionContext };
    const aiResponse = await callLLM({ prompt: aiPrompt, context });
    // Log message and response to Firestore
    const msgId = uuidv4();
    const sessionRef = db.collection('aiChatSessions').doc(sessionId);
    await sessionRef.set({
      user,
      role,
      startedAt: new Date().toISOString(),
      chartRef: chartContext?.chartId || null,
    }, { merge: true });
    await sessionRef.collection('messages').doc(msgId).set({
      sender: 'user',
      text: message,
      timestamp: Date.now(),
      role,
      ai: false,
    });
    await sessionRef.collection('messages').doc(msgId + '-ai').set({
      sender: 'ai',
      text: aiResponse,
      timestamp: Date.now() + 1,
      role,
      ai: true,
    });
    return res.status(200).json({ aiResponse });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
