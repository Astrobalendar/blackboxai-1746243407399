import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Horoscope, getHoroscope, findHoroscopesByUser, saveHoroscope, updateHoroscope } from '../services/horoscopeService';
import { useAuth } from '../context/AuthProvider';

export interface HoroscopeContextType {
  currentHoroscope: Horoscope | null;
  horoscopes: Horoscope[];
  loading: boolean;
  error: string | null;
  loadHoroscope: (id: string) => Promise<Horoscope | undefined>;
  loadHoroscopes: () => Promise<Horoscope[]>;
  saveHoroscope: (horoscopeData: Omit<Horoscope, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed' | 'chartData'>, chartData: any) => Promise<Horoscope>;
  updateHoroscope: (id: string, updates: Partial<Omit<Horoscope, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  clearError: () => void;
}

const HoroscopeContext = createContext<HoroscopeContextType | undefined>(undefined);

export const HoroscopeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentHoroscope, setCurrentHoroscope] = useState<Horoscope | null>(null);
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadHoroscope = async (id: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const horoscope = await getHoroscope(id);
      
      // Verify the user has access to this horoscope
      if (horoscope.userId !== user.uid) {
        throw new Error('Unauthorized access to horoscope');
      }
      
      setCurrentHoroscope(horoscope);
      return horoscope;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load horoscope');
      setCurrentHoroscope(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadHoroscopes = async () => {
    if (!user) {
      setHoroscopes([]);
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const userHoroscopes = await findHoroscopesByUser(user.uid);
      setHoroscopes(userHoroscopes);
      return userHoroscopes;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load horoscopes');
      setHoroscopes([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveNewHoroscope = async (
    horoscopeData: Omit<Horoscope, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed' | 'chartData'>,
    chartData: any
  ): Promise<Horoscope> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const savedHoroscope = await saveHoroscope(horoscopeData, chartData);
      await loadHoroscopes(); // Refresh the list
      return savedHoroscope;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to save horoscope');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingHoroscope = async (
    id: string,
    updates: Partial<Omit<Horoscope, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      await updateHoroscope(id, updates);
      
      // Update local state
      setHoroscopes(prev => 
        prev.map(h => h.id === id ? { ...h, ...updates } : h)
      );
      
      if (currentHoroscope?.id === id) {
        setCurrentHoroscope(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update horoscope');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Load user's horoscopes when user changes
  useEffect(() => {
    if (user) {
      loadHoroscopes().catch(console.error);
    }
  }, [user?.uid]);

  const value: HoroscopeContextType = {
    currentHoroscope,
    horoscopes,
    loading,
    error,
    loadHoroscope,
    loadHoroscopes,
    saveHoroscope: saveNewHoroscope,
    updateHoroscope: updateExistingHoroscope,
    clearError,
  };

  return (
    <HoroscopeContext.Provider value={value}>
      {children}
    </HoroscopeContext.Provider>
  );
};

export const useHoroscope = (): HoroscopeContextType => {
  const context = useContext(HoroscopeContext);
  if (context === undefined) {
    throw new Error('useHoroscope must be used within a HoroscopeProvider');
  }
  return context;
};
