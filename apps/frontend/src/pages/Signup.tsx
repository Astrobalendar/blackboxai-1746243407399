import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import styles from './Signup.module.css';

const roles = [
  { value: 'astrologer', label: 'Astrologer' },
  { value: 'student', label: 'Student' },
  { value: 'client', label: 'Client' },
];

const Signup: React.FC = () => {
  const location = useLocation();
  const [displayName, setDisplayName] = useState(location.state?.displayName ?? '');
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [photoURL, setPhotoURL] = useState(location.state?.photoURL ?? '');
  const [role, setRole] = useState('astrologer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
          const namePart = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
          const rand = Math.floor(1000 + Math.random() * 9000);
          return `${prefix}${namePart}${rand}`;
        }
        // user.displayName may be null, so fallback to empty string
        const uniqueId = genUserId(role, user.displayName ?? '');
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName ?? '',
          fullName: user.displayName ?? '',
          email: user.email ?? '',
          role,
          phone,
          photoURL: user.photoURL ?? '',
          createdAt: new Date().toISOString(),
          uniqueId,
          multipleHoroscopeAccess: role === 'astrologer',
          verified: false,
        }, { merge: true });
        setLoading(true);
        navigate('/birth-data-entry');
        // Show welcome and redirect
        alert(`Welcome ${user.displayName}! Your AstroBalendar ID is ${uniqueId}`);
        navigate('/birth-data');
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
        fullName: displayName,
        display_name: displayName,
        email,
        role,
        phone,
        photoURL,
        createdAt: new Date().toISOString(),
        uniqueId,
        multipleHoroscopeAccess: role === 'astrologer',
        verified: false,
      });
      // After signup, redirect to birth data entry for all roles
      navigate('/birth-data');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Your AstroBalendar Account</h2>
        {/* Google Signup Section */}
        {!location.state && (
          <>
            <button
              type="button"
              className={styles.signupGoogleBtn}
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
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className={styles.signupGoogleLogo} />
              {loading ? 'Signing up...' : 'Sign up with Google'}
            </button>
            <div className={styles.signupDivider}><span>or</span></div>
          </>
        )}
        {/* Show Google profile if in Google flow */}
        {location.state?.photoURL && (
          <div className={styles.signupPhotoContainer}>
            <img src={location.state.photoURL} alt="Google profile" className={styles.signupPhoto} />
          </div>
        )}
        {location.state?.displayName && (
          <div className={styles.signupDisplayname}>
            {location.state.displayName}
          </div>
        )}
        {/* Manual Signup Section */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="Enter your full name"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role-select" className={styles.label}>Role</label>
            <select
              id="role-select"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              className={styles.signupSelect}
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.signupField}>
            <label className={styles.signupLabel} htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className={styles.signupInput}
              autoComplete="email"
            />
          </div>
          {!isGoogleFlow && (
            <div className={styles.signupField}>
              <label className={styles.signupLabel} htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className={styles.signupInput}
                autoComplete="new-password"
              />
            </div>
          )}
          <div className={styles.signupField}>
            <label className={styles.signupLabel} htmlFor="signup-phone">Phone (optional)</label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className={styles.signupInput}
              autoComplete="tel"
            />
          </div>
          <div className={styles.signupField}>
            <label className={styles.signupLabel} htmlFor="signup-photo">Profile Photo URL (optional)</label>
            <input
              id="signup-photo"
              type="url"
              value={photoURL}
              onChange={e => setPhotoURL(e.target.value)}
              placeholder="Paste a photo URL (optional)"
              className={styles.signupInput}
              autoComplete="photo"
            />
          </div>
          <button type="submit" className={styles.button}>Sign Up</button>
          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
