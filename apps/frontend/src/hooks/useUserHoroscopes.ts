import { useState, useEffect } from 'react';
import { findHoroscopesByUser } from '../services/horoscopeService';
import { useAuth } from '../context/AuthContext';

export const useUserHoroscopes = () => {
  const { user } = useAuth();
  const [horoscopes, setHoroscopes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoroscopes = async () => {
    if (!user) {
      setHoroscopes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await findHoroscopesByUser(user.uid);
      setHoroscopes(data);
    } catch (err) {
      console.error('Error fetching horoscopes:', err);
      setError('Failed to load horoscopes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscopes();
  }, [user?.uid]);

  return {
    horoscopes,
    loading,
    error,
    refresh: fetchHoroscopes,
  };
};
