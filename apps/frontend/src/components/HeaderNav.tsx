import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useAuth } from '../context/AuthProvider';
import { useBirthData } from '../context/BirthDataContext';

const HeaderNav: React.FC = () => {
  const { user, loading } = useAuth();
  const { birthDataComplete } = useBirthData();
  const navigate = useNavigate();

  const fullName = user?.displayName || user?.email || 'User';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) return null;

  return (
    <nav className="w-full bg-yellow-600 shadow-lg py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white tracking-wide">🔮 AstroBalendar</h1>
      <div className="space-x-4 flex items-center">
        {!user ? (
          <>
            <Link to="/login">
              <button type="button" className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Login</button>
            </Link>
            <Link to="/signup">
              <button type="button" className="ml-2 bg-yellow-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-yellow-800 transition">Sign Up</button>
            </Link>
          </>
        ) : !birthDataComplete ? (
          <>
            <Link to="/birth-data" className="text-white hover:underline">Birth Data Entry</Link>
            <span className="ml-4 font-semibold text-white bg-yellow-700 px-3 py-1 rounded-lg">{fullName}</span>
            <button onClick={handleLogout} className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Logout</button>
          </>
        ) : (
          <>
            {!birthDataComplete ? (
              <>
                <Link to="/birth-data" className="text-white hover:underline">Birth Data Entry</Link>
                <span className="ml-4 font-semibold text-white bg-yellow-700 px-3 py-1 rounded-lg">{fullName}</span>
                <button onClick={handleLogout} className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/dashboard/client" className="text-white hover:underline">Dashboard</Link>
                <Link to="/new-horoscope" className="text-white hover:underline">New Horoscope</Link>
                <span className="ml-4 font-semibold text-white bg-yellow-700 px-3 py-1 rounded-lg">{fullName}</span>
                <button onClick={handleLogout} className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Logout</button>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default HeaderNav;