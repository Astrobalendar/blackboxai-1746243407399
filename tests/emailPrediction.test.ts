import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPredictionEmail } from '../apps/frontend/src/services/emailService';
import type { PredictionResult } from '../shared/types/prediction';
import { uploadFile } from '../apps/frontend/src/utils/storage';

// Mock the uploadFile function
vi.mock('../apps/frontend/src/utils/storage', () => ({
  uploadFile: vi.fn(),
}));

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Email Prediction Feature', () => {
  const mockPrediction: PredictionResult = {
    id: 'test-123',
    prediction: {
      userId: 'user-123',
      name: 'Test User',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      location: 'New York, NY',
      title: 'Test Prediction',
      description: 'This is a test prediction',
      date: new Date().toISOString(),
    },
    success: true,
  };

  const mockUploadResult = {
    url: 'https://firebasestorage.googleapis.com/test-prediction.pdf',
    path: 'predictions/test-prediction.pdf',
    name: 'test-prediction.pdf'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock uploadFile to return a download URL
    vi.mocked(uploadFile).mockResolvedValue(mockUploadResult);
    
    // Mock successful fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        message: 'Email sent successfully',
      }),
    } as Response);
  });

  it('should send an email with a prediction PDF', async () => {
    // Set test environment variables
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
    process.env.NEXT_PUBLIC_EMAIL_API_KEY = 'test-api-key';

    // Call the function
    await sendPredictionEmail(mockPrediction, 'test@example.com', {
      subject: 'Test Prediction',
      message: 'Please find your test prediction attached.',
    });

    // Verify the file was uploaded
    expect(uploadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'predictions/test-123.pdf',
      'application/pdf'
    );

    // Verify the API was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/send-email',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          url: 'https://firebasestorage.googleapis.com/test-prediction.pdf',
          subject: 'Test Prediction',
          message: 'Please find your test prediction attached.',
        }),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock a failed API response
    vi.mocked(uploadFile).mockReset();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      sendPredictionEmail(mockPrediction, 'test@example.com')
    ).rejects.toThrow('Failed to send email');
  });

  it('should validate email format', async () => {
    await expect(
      sendPredictionEmail(mockPrediction, 'invalid-email')
    ).rejects.toThrow();
  });
});
