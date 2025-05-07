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
    <Form onSubmit={handleSubmit} className="birth-data-form">
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      <div className="mb-3">
        <FormLabel>Full Name</FormLabel>
        <FormControl
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          isInvalid={!!errors.name}
        />
        <div className="invalid-feedback" style={{ display: errors.name ? 'block' : 'none' }}>
          {errors.name}
        </div>
      </div>

      <div className="mb-3">
        <FormLabel>Date of Birth</FormLabel>
        <FormControl
          type="text"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          isInvalid={!!errors.dateOfBirth}
          placeholder="DD/MM/YYYY"
        />
        <FormText className="text-muted">
          Please enter your date of birth in DD/MM/YYYY format
        </FormText>
        <div className="invalid-feedback" style={{ display: errors.dateOfBirth ? 'block' : 'none' }}>
          {errors.dateOfBirth}
        </div>
      </div>

      <div className="mb-3">
        <FormLabel>Time of Birth</FormLabel>
        <FormControl
          type="text"
          name="timeOfBirth"
          value={formData.timeOfBirth}
          onChange={handleInputChange}
          isInvalid={!!errors.timeOfBirth}
          placeholder="HH:MM"
        />
        <FormText className="text-muted">
          Please enter your time of birth in HH:MM format
        </FormText>
        <div className="invalid-feedback" style={{ display: errors.timeOfBirth ? 'block' : 'none' }}>
          {errors.timeOfBirth}
        </div>
      </div>

      <div className="mb-3">
        <FormLabel>Place of Birth</FormLabel>
        <FormControl
          type="text"
          name="placeOfBirth"
          value={formData.placeOfBirth}
          onChange={handleInputChange}
          isInvalid={!!errors.placeOfBirth}
        />
        <FormText className="text-muted">
          Enter your place of birth (city, country)
        </FormText>
        <div className="invalid-feedback" style={{ display: errors.placeOfBirth ? 'block' : 'none' }}>
          {errors.placeOfBirth}
        </div>
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Generating Prediction...' : 'Generate Prediction'}
        </Button>
      </div>
    </Form>
  );
};

export default BirthDataForm;
