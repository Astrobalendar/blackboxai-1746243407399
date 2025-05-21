// WARNING: Avoid circular imports with firebase.ts. Never import AuthProvider or useAuth in firebase.ts.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
export type { User };

import { getAuthSafe } from '../firebase';

import { doc, getDoc } from 'firebase/firestore';
import { getDbSafe } from '../firebase';

interface AuthContextProps {
  user: User | null;
  userRole: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({ user: null, userRole: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthSafe(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(getDbSafe(), 'users', firebaseUser.uid));
        const data = userDoc.exists() ? userDoc.data() : {};
        const role = data.role || null;
        // Optionally, you could also store display name in context if needed
        // const displayName = data.fullName || data.display_name || data.displayName || data.name || null;
        setUserRole(role);
        if (role) localStorage.setItem('userRole', role);
      } else {
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    console.error("AuthContext is undefined. This may be due to a circular import or improper provider setup.");
    throw new Error("AuthContext is undefined. Check for circular imports or missing AuthProvider.");
  }
  return ctx;
};
