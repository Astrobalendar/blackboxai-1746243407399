import React, { useState, useCallback } from 'react';
import { useEmailPrediction } from '../hooks/useEmailPrediction';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Mail, Send } from 'lucide-react';

// Define the PredictionResult type since we're having issues with the shared import
type PredictionResult = {
  id?: string;
  prediction?: any;
  success?: boolean;
  error?: string | null;
  predictionId?: string;
};

type ButtonVariant = NonNullable<ButtonProps['variant']>;
type ButtonSize = NonNullable<ButtonProps['size']>;

interface EmailPredictionButtonProps {
  /** The prediction data to be sent via email */
  prediction: PredictionResult;
  /** Text to display on the button */
  buttonText?: string;
  /** Visual style variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Additional CSS classes */
  className?: string;
}

export const EmailPredictionButton: React.FC<EmailPredictionButtonProps> = ({
  prediction,
  buttonText = 'Email Prediction',
  variant = 'outline',
  size = 'default',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { sendEmail, isSending, error, reset } = useEmailPrediction({
    onSuccess: useCallback(() => {
      toast.success('Email sent successfully!');
      setIsOpen(false);
      setEmail('');
    }, []),
    onError: useCallback((error: Error) => {
      console.error('Error sending email:', error);
      toast.error(error?.message || 'Failed to send email');
    }, []),
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.trim());
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await sendEmail(prediction, email);
      // onSuccess callback will handle the rest
    } catch (error) {
      // onError callback will handle the error
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    reset();
    setEmail('');
  }, [reset]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpen}
        disabled={isSending}
        className={`flex items-center gap-2 ${className || ''}`}
        aria-label={isSending ? 'Sending email...' : 'Send email with prediction'}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Mail className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{isSending ? 'Sending...' : buttonText}</span>
      </Button>

      <Dialog 
        open={isOpen} 
        onOpenChange={(open: boolean) => {
          if (!isSending) {
            setIsOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Prediction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Recipient Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
                disabled={isSending}
                placeholder="Enter email address"
                aria-required="true"
                aria-label="Recipient email address"
                className="w-full"
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-500">
                {error.message}
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSending || !email}
                className="flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
