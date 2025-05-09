import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthProvider';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/birth-data');
    } catch (error) {
      alert('Google sign-in failed');
      console.error(error);
    }
  };

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <button onClick={() => navigate('/birth-data')}>Go to Birth Data</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Sign in to AstroBalendar</h2>
      <button onClick={handleGoogleSignIn} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
