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

  const [loading, setLoading] = React.useState(false);
const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

return (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6b21a8 0%, #111827 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: 36, maxWidth: 400, width: '100%' }}>
      <h2 style={{ marginBottom: 28, textAlign: 'center', color: '#6b21a8', fontWeight: 800, fontSize: 28 }}>Sign in to AstroBalendar</h2>
      <button
        onClick={async () => {
          setLoading(true);
          setErrorMsg(null);
          try {
            await handleGoogleSignIn();
          } catch (e: any) {
            setErrorMsg('Google sign-in failed. Please try again.');
          } finally {
            setLoading(false);
          }
        }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#fff', color: '#222', border: '1.5px solid #a78bfa', borderRadius: 8,
          padding: '12px 0', fontWeight: 700, fontSize: 17, width: '100%', marginBottom: 18, boxShadow: '0 2px 6px rgba(107,33,168,0.08)', cursor: 'pointer', transition: 'background 0.2s',
        }}
        disabled={loading}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: 22, height: 22 }} />
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ color: '#555', fontWeight: 500 }}>Don't have an account?</span>
        <button
          onClick={() => navigate('/signup')}
          style={{ color: '#6b21a8', background: 'none', border: 'none', fontWeight: 700, marginLeft: 8, cursor: 'pointer', fontSize: 16 }}
        >Sign up</button>
      </div>
      {errorMsg && (
        <div style={{ color: '#b91c1c', background: '#fee2e2', borderRadius: 6, padding: 10, marginTop: 8, textAlign: 'center', fontWeight: 700 }}>{errorMsg}</div>
      )}
    </div>
  </div>
);
};

export default Login;
