import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../styles/global.css';

const roles = [
  { value: 'astrologer', label: 'Astrologer' },
  { value: 'student', label: 'Student' },
  { value: 'client', label: 'Client' },
];

const Signup: React.FC = () => {
  const location = useLocation();
  const [displayName, setDisplayName] = useState(location.state?.displayName || '');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('astrologer');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState(location.state?.photoURL || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isGoogleFlow = !!location.state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isGoogleFlow) {
        const user = auth.currentUser;
        if (!user) {
          setError('No signed-in user found.');
          return;
        }
        // Generate unique user ID
        function genUserId(role: string, name: string) {
          const prefix = role === 'astrologer' ? 'AS' : role === 'student' ? 'ST' : 'CL';
          const namePart = (name || user.displayName || '').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
          const rand = Math.floor(1000 + Math.random() * 9000);
          return `${prefix}${namePart}${rand}`;
        }
        const uniqueId = genUserId(role, user.displayName);
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          role,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          uniqueId,
          multipleHoroscopeAccess: role === 'astrologer',
        }, { merge: true });
        // Show welcome and redirect
        alert(`Welcome ${user.displayName}! Your AstroBalendar ID is ${uniqueId}`);
        navigate('/birthdata');
        return;
      }
      // Normal email/password signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName, photoURL });
      // Generate unique user ID
      function genUserId(role: string, name: string) {
        const prefix = role === 'astrologer' ? 'AS' : role === 'student' ? 'ST' : 'CL';
        const namePart = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${namePart}${rand}`;
      }
      const uniqueId = genUserId(role, displayName);
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        role,
        phone,
        photoURL,
        createdAt: new Date().toISOString(),
        uniqueId,
        multipleHoroscopeAccess: role === 'astrologer',
        verified: false, // Add verified field
      });
      // After signup, redirect to birth data entry for all roles
      navigate('/birthdata');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-bg" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6b21a8 0%, #111827 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="signup-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: 32, maxWidth: 400, width: '100%' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center', color: '#6b21a8', fontWeight: 800, fontSize: 28 }}>Create Your AstroBalendar Account</h2>
{location.state?.photoURL && (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
    <img src={location.state.photoURL} alt="Google profile" style={{ width: 64, height: 64, borderRadius: '50%', boxShadow: '0 2px 8px #a78bfa33' }} />
  </div>
)}
{location.state?.displayName && (
  <div style={{ textAlign: 'center', fontWeight: 700, color: '#6b21a8', marginBottom: 10, fontSize: 18 }}>
    {location.state.displayName}
  </div>
)}
{!location.state && (
  <button
    type="button"
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      background: '#fff', color: '#222', border: '1.5px solid #a78bfa', borderRadius: 8,
      padding: '12px 0', fontWeight: 700, fontSize: 17, width: '100%', marginBottom: 18, boxShadow: '0 2px 6px rgba(107,33,168,0.08)', cursor: 'pointer', transition: 'background 0.2s',
    }}
    onClick={async () => {
      setError('');
      setLoading(true);
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Redirect to signup with Google profile info
        navigate('/signup', { state: { email: user.email, displayName: user.displayName, photoURL: user.photoURL } });
      } catch (e: any) {
        setError('Google sign-up failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }}
    disabled={loading}
  >
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: 22, height: 22 }} />
    {loading ? 'Signing up...' : 'Sign up with Google'}
  </button>
)}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <label style={{ fontWeight: 700, color: '#222', fontSize: 18 }}>Name
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="Enter your name"
              style={{ marginTop: 6, padding: 12, borderRadius: 7, border: '1.5px solid #a78bfa', width: '100%', fontWeight: 600, fontSize: 16, color: '#222' }}
            />
          </label>
          <label htmlFor="role-select" style={{ fontWeight: 700, color: '#222', fontSize: 18 }}>Role</label>
          <select
            id="role-select"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 7, border: '1.5px solid #a78bfa', fontWeight: 600, fontSize: 16, color: '#222' }}
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <label style={{ fontWeight: 700, color: '#222', fontSize: 18 }}>Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ marginTop: 6, padding: 12, borderRadius: 7, border: '1.5px solid #a78bfa', width: '100%', fontWeight: 600, fontSize: 16, color: '#222' }}
            />
          </label>
          <label style={{ fontWeight: 700, color: '#222', fontSize: 18 }}>Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter a password"
              style={{ marginTop: 6, padding: 12, borderRadius: 7, border: '1.5px solid #a78bfa', width: '100%', fontWeight: 600, fontSize: 16, color: '#222' }}
            />
          </label>
          <label style={{ fontWeight: 700, color: '#222', fontSize: 18 }}>Phone (optional)
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              style={{ marginTop: 6, padding: 12, borderRadius: 7, border: '1.5px solid #a78bfa', width: '100%', fontWeight: 600, fontSize: 16, color: '#222' }}
            />
          </label>
          <label style={{ fontWeight: 700, color: '#222', fontSize: 18 }}>Profile Photo URL (optional)
            <input
              type="url"
              value={photoURL}
              onChange={e => setPhotoURL(e.target.value)}
              placeholder="Paste a photo URL (optional)"
              style={{ marginTop: 6, padding: 12, borderRadius: 7, border: '1.5px solid #a78bfa', width: '100%', fontWeight: 600, fontSize: 16, color: '#222' }}
            />
          </label>
          <button type="submit" style={{ background: '#6b21a8', color: '#fff', padding: '14px 0', borderRadius: 8, border: 'none', fontWeight: 800, fontSize: 18, marginTop: 10, letterSpacing: 1 }}>Sign Up</button>
          {error && <div style={{ color: '#b91c1c', background: '#fee2e2', borderRadius: 6, padding: 10, marginTop: 8, textAlign: 'center', fontWeight: 700 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
