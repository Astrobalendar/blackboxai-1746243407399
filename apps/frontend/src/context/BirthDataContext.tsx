import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface BirthDataContextProps {
  birthDataComplete: boolean;
  loading: boolean;
}

const BirthDataContext = createContext<BirthDataContextProps>({ birthDataComplete: false, loading: true });

export const BirthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [birthDataComplete, setBirthDataComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBirthData = async () => {
      if (authLoading) return;
      if (!user) {
        setBirthDataComplete(false);
        setLoading(false);
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.exists() ? docSnap.data() : {};
      if (data.fullName && data.dateOfBirth && data.timeOfBirth && data.state && data.city && data.country && data.timeZone) {
        setBirthDataComplete(true);
      } else {
        setBirthDataComplete(false);
      }
      setLoading(false);
    };
    checkBirthData();
  }, [user, authLoading]);

  return (
    <BirthDataContext.Provider value={{ birthDataComplete, loading }}>
      {children}
    </BirthDataContext.Provider>
  );
};

export const useBirthData = () => useContext(BirthDataContext);
