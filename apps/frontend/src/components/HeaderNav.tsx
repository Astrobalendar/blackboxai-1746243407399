import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const HeaderNav: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Try to get full name from Firestore if available
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : (data.displayName || firebaseUser.displayName || firebaseUser.email));
        } else {
          setFullName(firebaseUser.displayName || firebaseUser.email);
        }
      } else {
        setFullName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-yellow-600 shadow-lg py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white tracking-wide">🔮 AstroBalendar</h1>
      <div className="space-x-4 flex items-center">
        <Link to="/" className="text-white hover:underline">Home</Link>
        <Link to="/calendar" className="text-white hover:underline">Calendar</Link>
        <Link to="/chat" className="text-white hover:underline">Chat</Link>
        <Link to="/new-horoscope" className="text-white hover:underline">New Horoscope</Link>
        <Link to="/birth-data" className="text-white hover:underline">Birth Data</Link>
        {user ? (
          <>
            <span className="ml-4 font-semibold text-white bg-yellow-700 px-3 py-1 rounded-lg">{fullName}</span>
            <button onClick={handleLogout} className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button type="button" className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Login</button>
            </Link>
            <Link to="/signup">
              <button type="button" className="ml-2 bg-yellow-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-yellow-800 transition">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default HeaderNav;