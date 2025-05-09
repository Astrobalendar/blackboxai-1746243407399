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
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {isGoogleFlow ? (
          <>
            <label htmlFor="role-select">Role:</label>
            <select
              id="role-select"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <br />
            <button type="submit">Continue</button>
          </>
        ) : (
          <>
            <label>
              Name:
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </label>
            <br />
            <label htmlFor="role-select">Role:</label>
            <select
              id="role-select"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <br />
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Phone (optional):
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </label>
            <br />
            <label>
              Profile Photo URL (optional):
              <input
                type="url"
                value={photoURL}
                onChange={e => setPhotoURL(e.target.value)}
              />
            </label>
            <br />
            <button type="submit">Sign Up</button>
          </>
        )}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Signup;
