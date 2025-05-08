import React, { useState } from 'react';
import { Button, Form, FormLabel, FormControl, FormText } from 'react-bootstrap';
import { locationData } from '@/lib/locationData';
import { AstrologicalPrediction } from '@/types/astrology';

interface BirthData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: string;
  longitude: string;
  timeZone: string;
}

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  loading: boolean;
  error: string | null;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<BirthData>({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    latitude: '',
    longitude: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [errors, setErrors] = useState<Partial<BirthData>>({});

  const validateDate = (date: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);

    if (dateObj.getFullYear() !== year) return false;
    if (dateObj.getMonth() !== month - 1) return false;
    if (dateObj.getDate() !== day) return false;

    return true;
  };

  const validateTime = (time: string): boolean => {
    const regex = /^(\d{2}):(\d{2})$/;
    if (!regex.test(time)) return false;

    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the changed field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Partial<BirthData> = {};

    // Validate required fields
    const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'] as const;
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate date format
    if (formData.dateOfBirth && !validateDate(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
    }

    // Validate time format
    if (formData.timeOfBirth && !validateTime(formData.timeOfBirth)) {
      newErrors.timeOfBirth = 'Please enter a valid time (HH:MM)';
    }

    // If there are any errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If location data is missing, try to get it using geocoding
    if (!formData.latitude || !formData.longitude || !formData.timeZone) {
      try {
        // Simple mock geocoding - in production, use a real geocoding service
        const place = formData.placeOfBirth.toLowerCase();
        const mockLocationData: Record<string, { latitude: string; longitude: string; timeZone: string }> = {
          'sholinghur': { latitude: '13.1210', longitude: '79.4182', timeZone: 'Asia/Kolkata' },
          'chennai': { latitude: '13.0827', longitude: '80.2707', timeZone: 'Asia/Kolkata' },
          'bangalore': { latitude: '12.9716', longitude: '77.5946', timeZone: 'Asia/Kolkata' },
          'mumbai': { latitude: '19.0760', longitude: '72.8777', timeZone: 'Asia/Kolkata' },
          'delhi': { latitude: '28.7041', longitude: '77.1025', timeZone: 'Asia/Kolkata' },
          'kolkata': { latitude: '22.5726', longitude: '88.3639', timeZone: 'Asia/Kolkata' },
          'hyderabad': { latitude: '17.3850', longitude: '78.4867', timeZone: 'Asia/Kolkata' }
        };

        const location = mockLocationData[place];
        if (location) {
          setFormData(prev => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
            timeZone: location.timeZone
          }));
        } else {
          throw new Error('Location not found');
        }
      } catch (error) {
        console.error('Error getting location data:', error);
        newErrors.placeOfBirth = 'Could not find location data';
        setErrors(newErrors);
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-purple-400 text-sm mt-1">
            Please enter your full name
          </p>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Date of Birth</label>
          <input
            type="text"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            placeholder="DD/MM/YYYY"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-purple-400 text-sm mt-1">
            Enter your date of birth (e.g., 01/01/2000)
          </p>
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Time of Birth</label>
          <input
            type="text"
            name="timeOfBirth"
            value={formData.timeOfBirth}
            onChange={handleInputChange}
            placeholder="HH:MM"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-purple-400 text-sm mt-1">
            Enter your time of birth (e.g., 12:30)
          </p>
          {errors.timeOfBirth && (
            <p className="text-red-500 text-sm mt-1">
              {errors.timeOfBirth}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Place of Birth</label>
          <input
            type="text"
            name="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={handleInputChange}
            placeholder="Enter your place of birth"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-purple-400 text-sm mt-1">
            Enter your place of birth
          </p>
          {errors.placeOfBirth && (
            <p className="text-red-500 text-sm mt-1">
              {errors.placeOfBirth}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            'Get Prediction'
          )}
        </button>

        {error && (
          <p className="text-red-500 text-center mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default BirthDataForm;
