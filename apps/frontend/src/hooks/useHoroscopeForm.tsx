import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveHoroscope } from '../services/horoscopeService';
import { getChartData } from '../services/astrology';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const useHoroscopeForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    timeZone: string;
  }) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Generate chart data
      const chartData = await getChartData({
        dateOfBirth: formData.birthDate,
        timeOfBirth: formData.birthTime,
        locationName: formData.birthPlace,
        latitude: formData.latitude,
        longitude: formData.longitude,
        timeZone: formData.timeZone,
      });

      // 2. Save horoscope to Firestore
      const savedHoroscope = await saveHoroscope(
        {
          userId: user.uid,
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timeZone: formData.timeZone,
        },
        chartData
      );

      toast.success('Horoscope saved successfully!');
      return savedHoroscope;
    } catch (err) {
      console.error('Error saving horoscope:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save horoscope';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveHoroscope: handleSubmit,
  };
};
