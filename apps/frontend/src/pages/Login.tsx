import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user doc exists, create if not
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let role = null;
      if (!userDocSnap.exists()) {
        // New Google user, redirect to signup for role selection
        navigate('/signup', { state: { email: user.email, displayName: user.displayName, photoURL: user.photoURL } });
        return;
      } else {
        role = userDocSnap.data().role;
      }
      // Redirect based on role
      if (role === 'astrologer') navigate('/dashboard/astrologer');
      else if (role === 'student') navigate('/dashboard/student');
      else navigate('/dashboard/client');
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
      <button onClick={handleGoogleSignIn} className="google-signin-btn">
        Sign in with Google
      </button>
      <div className="signup-link-area">
        <span>Don't have an account? </span>
        <button onClick={() => navigate('/signup')} className="signup-btn">
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
