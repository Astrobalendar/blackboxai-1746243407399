// Import vitest methods
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { EmailPredictionButton } from '../EmailPredictionButton';

// Mock the useEmailPrediction hook
const mockUseEmailPrediction = vi.fn();

// Mock dependencies
vi.mock('../../hooks/useEmailPrediction', () => ({
  useEmailPrediction: () => mockUseEmailPrediction(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock prediction data for testing
const mockPrediction = {
  id: 'test-123',
  prediction: { sign: 'Aries', date: '2023-01-01' },
  success: true,
  error: null,
  predictionId: 'pred-123',
};

describe('EmailPredictionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toast.success when email is sent successfully', async () => {
    mockUseEmailPrediction.mockReturnValue({
      sendEmail: vi.fn().mockResolvedValue({ success: true }),
      isSending: false,
      error: null,
      reset: vi.fn(),
    });

    render(<EmailPredictionButton prediction={mockPrediction} />);
    
    // Open the dialog
    const button = screen.getByRole('button', { name: /email prediction/i });
    fireEvent.click(button);
    
    // Enter email and submit
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Email sent successfully!');
    });
  });

  it('calls toast.error on invalid email input', async () => {
    mockUseEmailPrediction.mockReturnValue({
      sendEmail: vi.fn(),
      isSending: false,
      error: null,
      reset: vi.fn(),
    });

    render(<EmailPredictionButton prediction={mockPrediction} />);
    
    // Open the dialog
    const button = screen.getByRole('button', { name: /email prediction/i });
    fireEvent.click(button);
    
    // Enter invalid email and submit
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address');
    });
  });
});
