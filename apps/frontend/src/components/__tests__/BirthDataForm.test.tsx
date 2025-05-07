import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthDataForm from '../BirthDataForm';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { mockApi } from '@/__tests__/mocks/api';

// Mock location data
jest.mock('../lib/locationData', () => ({
  geoLookup: jest.fn()
}));

// Mock API
jest.mock('node-fetch', () => {
  return jest.fn().mockImplementation((url, options) => {
    if (url === 'https://astrobalendar-backend.onrender.com/api/predict') {
      return mockApi.success();
    }
    return Promise.reject(new Error('Invalid URL'));
  });
});

describe('BirthDataForm', () => {
  const mockSubmit = jest.fn();
  const mockNavigate = jest.fn();

  const renderForm = () => {
    return render(
      <MemoryRouter>
        <BirthDataForm onSubmit={mockSubmit} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Date validation tests
  describe('Date validation', () => {
    test('should validate valid date', async () => {
      renderForm();
      const dateInput = screen.getByLabelText(/date of birth/i);
      fireEvent.change(dateInput, { target: { value: '29/02/2024' } });
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid date/i)).not.toBeInTheDocument();
      });
    });

    test('should validate invalid date (leap year)', async () => {
      renderForm();
      const dateInput = screen.getByLabelText(/date of birth/i);
      fireEvent.change(dateInput, { target: { value: '29/02/2023' } });
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid date/i)).toBeInTheDocument();
      });
    });

    test('should validate invalid date (month range)', async () => {
      renderForm();
      const dateInput = screen.getByLabelText(/date of birth/i);
      fireEvent.change(dateInput, { target: { value: '32/01/2024' } });
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid date/i)).toBeInTheDocument();
      });
    });
  });

  // Time validation tests
  describe('Time validation', () => {
    test('should validate valid time', async () => {
      renderForm();
      const timeInput = screen.getByLabelText(/time of birth/i);
      fireEvent.change(timeInput, { target: { value: '23:59' } });
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid time/i)).not.toBeInTheDocument();
      });
    });

    test('should validate invalid time', async () => {
      renderForm();
      const timeInput = screen.getByLabelText(/time of birth/i);
      fireEvent.change(timeInput, { target: { value: '24:60' } });
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid time/i)).toBeInTheDocument();
      });
    });
  });

  // Location validation tests
  describe('Location validation', () => {
    test('should validate valid location', async () => {
      (geoLookup as jest.Mock).mockReturnValue({ lat: '13.1210', lon: '79.4182' });
      renderForm();
      const locationInput = screen.getByLabelText(/place of birth/i);
      fireEvent.change(locationInput, { target: { value: 'Sholinghur' } });
      fireEvent.blur(locationInput);
      await waitFor(() => {
        expect(screen.getByText(/📍 Lat: 13.1210, Lon: 79.4182/i)).toBeInTheDocument();
      });
    });

    test('should validate invalid location', async () => {
      (geoLookup as jest.Mock).mockReturnValue({ lat: '', lon: '' });
      renderForm();
      const locationInput = screen.getByLabelText(/place of birth/i);
      fireEvent.change(locationInput, { target: { value: 'Invalid Place' } });
      fireEvent.blur(locationInput);
      await waitFor(() => {
        expect(screen.getByText(/please select a valid location/i)).toBeInTheDocument();
      });
    });
  });

  // Form submission tests
  describe('Form submission', () => {
    test('should submit valid form data', async () => {
      renderForm();
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '01/01/2000' } });
      fireEvent.change(screen.getByLabelText(/time of birth/i), { target: { value: '12:00' } });
      fireEvent.change(screen.getByLabelText(/place of birth/i), { target: { value: 'Sholinghur' } });
      fireEvent.blur(screen.getByLabelText(/place of birth/i));

      // Click Next
      fireEvent.click(screen.getByText(/next: confirm details/i));

      // Click Get Horoscope
      fireEvent.click(screen.getByText(/get horoscope/i));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'Test User',
          dateOfBirth: '01/01/2000',
          timeOfBirth: '12:00',
          placeOfBirth: 'Sholinghur',
          latitude: '13.1210',
          longitude: '79.4182',
          timeZone: expect.any(String)
        });
      });
    });

    test('should show error for invalid form', async () => {
      renderForm();
      
      // Click Next without filling form
      fireEvent.click(screen.getByText(/next: confirm details/i));

      await waitFor(() => {
        expect(screen.getByText(/please enter a name/i)).toBeInTheDocument();
      });
    });
  });
});
