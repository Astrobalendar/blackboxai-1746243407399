import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewHoroscope from '../NewHoroscope';
import { mockApi } from '../../__tests__/mocks/api';
import '@testing-library/jest-dom';

// Mock API calls
jest.mock('node-fetch', () => {
  return jest.fn().mockImplementation((url: string, options: any) => {
    if (url === 'https://astrobalendar-backend.onrender.com/api/predict') {
      return mockApi.success();
    }
    return Promise.reject(new Error('Invalid URL'));
  });
});

describe('NewHoroscope', () => {
  // Add mock for toast notifications
  const mockToast = {
    success: jest.fn(),
    error: jest.fn()
  };
  jest.mock('react-toastify', () => ({
    toast: mockToast
  }));

  // Add mock for MongoDB error logging
  const mockMongoLog = jest.fn();
  jest.mock('@/services/errorLogger', () => ({
    logError: mockMongoLog
  }));

  // Add mock for location data
  jest.mock('@/lib/locationData', () => ({
    geoLookup: jest.fn()
  }));

  // Add mock for API
  const mockFetch = jest.fn();
  jest.mock('node-fetch', () => mockFetch);

  beforeEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  // API success case
  describe('API Success', () => {
    it('renders form and handles successful submission', async () => {
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Fill form
      const dateInput = screen.getByLabelText(/date of birth/i);
      const timeInput = screen.getByLabelText(/time of birth/i);
      const placeInput = screen.getByLabelText(/place of birth/i);

      await userEvent.type(dateInput, '01/01/2000');
      await userEvent.type(timeInput, '12:00');
      await userEvent.type(placeInput, 'New York');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /generate horoscope/i });
      fireEvent.click(submitButton);

      // Wait for API response
      await waitFor(() => {
        expect(screen.getByText(/generating horoscope/i)).toBeInTheDocument();
      });

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/horoscope generated successfully/i)).toBeInTheDocument();
      });

      // Wait for first house
      await waitFor(() => {
        expect(screen.getByText(/first house/i)).toBeInTheDocument();
      });

      // Verify API was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://astrobalendar-backend.onrender.com/api/predict',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  // API error cases
  describe('API Error Handling', () => {
    test('should handle server error (500)', async () => {
      mockFetch.mockResolvedValueOnce(mockApi.serverError());
      
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Submit form
      fireEvent.click(screen.getByText(/get horoscope/i));

      await waitFor(() => {
        expect(screen.getByText(/error fetching prediction/i)).toBeInTheDocument();
      });
    });

    test('should handle authentication error (401)', async () => {
      mockFetch.mockResolvedValueOnce(mockApi.authError(401));
      
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Submit form
      fireEvent.click(screen.getByText(/get horoscope/i));

      await waitFor(() => {
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
      });
    });

    test('should handle validation error (422)', async () => {
      mockFetch.mockResolvedValueOnce(mockApi.validationError());
      
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Submit form
      fireEvent.click(screen.getByText(/get horoscope/i));

      await waitFor(() => {
        expect(screen.getByText(/invalid data format/i)).toBeInTheDocument();
      });
    });

    test('should handle timeout error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));
      
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Submit form
      fireEvent.click(screen.getByText(/get horoscope/i));

      await waitFor(() => {
        expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
      });
    });
  });

  // Retry logic tests
  describe('Retry Logic', () => {
    test('should retry after timeout', async () => {
      // First call times out
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));
      // Second call succeeds
      mockFetch.mockResolvedValueOnce(mockApi.success());
      
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Submit form
      fireEvent.click(screen.getByText(/get horoscope/i));

      // Wait for first timeout
      await waitFor(() => {
        expect(screen.getByText(/retrying/i)).toBeInTheDocument();
      });

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText(/first house/i)).toBeInTheDocument();
      });
    });

    test('should show max retries error', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new Error('Request timeout'));
      
      render(
        <MemoryRouter>
          <NewHoroscope />
        </MemoryRouter>
      );

      // Submit form
      fireEvent.click(screen.getByText(/get horoscope/i));

      // Wait for max retries
      await waitFor(() => {
        expect(screen.getByText(/maximum retries reached/i)).toBeInTheDocument();
      });
    });
  });
});
