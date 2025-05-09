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
  const location = useLocation() as any;
  const [displayName, setDisplayName] = useState(location.state?.displayName || '');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('astrologer');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState(location.state?.photoURL || '');
  const [error, setError] = useState<string | null>(null);
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
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          role,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        }, { merge: true });
        // Redirect based on role
        if (role === 'astrologer') navigate('/dashboard/astrologer');
        else if (role === 'student') navigate('/dashboard/student');
        else navigate('/dashboard/client');
        return;
      }
      // Normal email/password signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName, photoURL });
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        role,
        phone,
        photoURL,
        createdAt: new Date().toISOString(),
      });
      // Redirect based on role
      if (role === 'astrologer') navigate('/dashboard/astrologer');
      else if (role === 'student') navigate('/dashboard/student');
      else navigate('/dashboard/client');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-bg" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6b21a8 0%, #111827 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="signup-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: 32, maxWidth: 400, width: '100%' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center', color: '#6b21a8', fontWeight: 800, fontSize: 28 }}>Create Your AstroBalendar Account</h2>
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
