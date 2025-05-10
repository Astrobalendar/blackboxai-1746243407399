import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

import { useLocation } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return setIsVerified(false);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const verified = userDoc.exists() ? userDoc.data().verified : false;
      setIsVerified(!!verified && user.emailVerified);
      setChecking(false);
    };
    if (user) {
      checkVerification();
    } else {
      setChecking(false);
    }
  }, [user]);

  if (loading || checking) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!userRole) return <Navigate to="/role-selection" />;
  // Allow access to /birthdata for logged-in users even if not verified
  if (!isVerified && location.pathname !== '/birthdata') return <Navigate to="/birthdata" />;
  return <>{children}</>;
};

export default PrivateRoute;
