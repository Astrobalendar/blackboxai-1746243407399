import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useRequireBirthData() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (loading) return;
      if (!user) {
        navigate('/login');
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.exists() ? docSnap.data() : {};
      // Check all required fields
      if (!data.fullName || !data.dateOfBirth || !data.timeOfBirth || !data.state || !data.city || !data.timeZone) {
        navigate('/birth-data');
      }
      setChecking(false);
    };
    check();
  }, [user, loading, navigate]);

  return { checking };
}
