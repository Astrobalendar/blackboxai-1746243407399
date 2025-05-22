import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '../../../lib/firebase-admin';

// Initialize Firebase Admin
const admin = initializeFirebaseAdmin();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    if (!decodedToken.uid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { to, subject, url, predictionId } = req.body;

    if (!to || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
    // This is a placeholder implementation
    console.log(`Would send email to: ${to}`);
    console.log(`Subject: ${subject || 'Your Astrological Prediction'}`);
    console.log(`URL: ${url}`);

    // Here you would typically call your email service
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to,
      from: 'noreply@astrobalendar.com',
      subject: subject || 'Your Astrological Prediction',
      text: `Here's your prediction: ${url}`,
      html: `
        <h1>Your Astrological Prediction</h1>
        <p>Click <a href="${url}">here</a> to download your prediction.</p>
        <p>Or copy this link: ${url}</p>
      `,
    };
    
    await sgMail.send(msg);
    */

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
