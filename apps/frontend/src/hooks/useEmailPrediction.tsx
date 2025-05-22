import { useState, useCallback } from 'react';
import { sendPredictionEmail } from '../services/emailService';
import { toast } from 'sonner';
import { PredictionResult } from '@shared/types/prediction';

interface UseEmailPredictionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useEmailPrediction = (options: UseEmailPredictionOptions = {}) => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendEmail = useCallback(
    async (prediction: PredictionResult, email: string) => {
      setIsSending(true);
      setError(null);

      try {
        await sendPredictionEmail(
          {
            ...prediction,
            prediction: prediction.prediction || {},
          },
          email,
          {
            subject: 'Your Astrobalendar Prediction',
            message: 'Here is your requested prediction from Astrobalendar.',
          }
        );
        toast.success('Email sent successfully!');
        options.onSuccess?.();
      } catch (err) {
        console.error('Error sending email:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
        setError(new Error(errorMessage));
        toast.error(errorMessage);
        options.onError?.(new Error(errorMessage));
      } finally {
        setIsSending(false);
      }
    },
    [options]
  );

  return {
    sendEmail,
    isSending,
    error,
    reset: () => setError(null),
  };
};
