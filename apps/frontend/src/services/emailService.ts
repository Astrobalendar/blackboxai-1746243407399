import { toast } from 'sonner';
import { PredictionResult } from '@shared/types/prediction';

interface UploadResult {
  url: string;
  path: string;
  // Add other fields as needed
}

interface EmailOptions {
  subject?: string;
  message?: string;
  fileName?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Sends an email with the exported prediction PDF
 * @param prediction The prediction result to send
 * @param email The recipient's email address
 * @param options Additional email options
 * @returns Promise that resolves when the email is sent
 */
export const sendPredictionEmail = async (
  prediction: Omit<PredictionResult, 'success' | 'error' | 'predictionId'> & {
    success?: boolean;
    error?: string | null;
    predictionId?: string;
  },
  email: string,
  options: EmailOptions = {}
): Promise<void> => {
  const {
    subject = 'Your Astrobalendar Prediction',
    message = 'Here is your requested prediction from Astrobalendar.',
    fileName = `prediction_${prediction.id || Date.now()}.pdf`
  } = options;

  try {
    // First, export the prediction to get the download URL
    const { exportPrediction } = await import('./exportService');
    const uploadResult: UploadResult = await exportPrediction(prediction, {
      fileName,
      includeCharts: true,
      includePredictions: true,
      includeRemedies: true,
    });

    if (!uploadResult?.url) {
      throw new Error('Failed to generate prediction PDF');
    }

    // Get the API key from Firebase Auth token
    const { getAuth, getIdToken } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await getIdToken(user);
    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EMAIL_API_KEY || idToken}`,
      },
      body: JSON.stringify({
        email,
        url: uploadResult.url,
        subject,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to send email');
    }

    toast.success('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    toast.error(errorMessage);
  }
};

/**
 * Hook to use the email service
 * @returns Object with email sending function
 */
export const useEmailService = () => {
  return {
    sendPredictionEmail,
  };
};
