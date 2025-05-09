import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('astrologer');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
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
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Signup;
