import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from '../firebase';

const roles = [
  { value: 'astrologer', label: 'Astrologer' },
  { value: 'student', label: 'Student' },
  { value: 'client', label: 'Client' },
];

const Signup: React.FC = () => {
  const location = useLocation();
  const [fullName, setFullName] = useState(location.state?.displayName ?? '');
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
        const user = getAuthSafe().currentUser;
        if (!user) {
          setError('No signed-in user found.');
          return;
        }
        function genUserId(role: string, name: string) {
          const prefix = role === 'astrologer' ? 'AS' : role === 'student' ? 'ST' : 'CL';
          const namePart = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
          const rand = Math.floor(1000 + Math.random() * 9000);
          return `${prefix}${namePart}${rand}`;
        }
        const uniqueId = genUserId(role, user.displayName ?? '');
        await setDoc(doc(getDbSafe(), 'users', user.uid), {
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
        alert(`Welcome ${user.displayName}! Your AstroBalendar ID is ${uniqueId}`);
        navigate('/birth-data');
        return;
      }
      // Normal email/password signup
      const userCredential = await createUserWithEmailAndPassword(getAuthSafe(), email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName, photoURL });
      function genUserId(role: string, name: string) {
        const prefix = role === 'astrologer' ? 'AS' : role === 'student' ? 'ST' : 'CL';
        const namePart = (name || '').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${namePart}${rand}`;
      }
      const uniqueId = genUserId(role, fullName);
      await setDoc(doc(getDbSafe(), 'users', user.uid), {
        fullName,
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-yellow-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-md bg-white/30 backdrop-blur rounded-xl shadow-xl p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-purple-800 mb-2">Create Your AstroBalendar Account</h2>
          <p className="text-sm text-gray-600 text-center mb-4">Sign up to access personalized horoscopes and features</p>
        </div>
        {/* Google Signup Section */}
        {!location.state && (
          <>
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 py-2 text-base font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
              onClick={async () => {
                setError(null);
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M23.766 12.276c0-.818-.074-1.6-.212-2.353H12.24v4.451h6.48c-.28 1.457-1.13 2.693-2.406 3.522v2.917h3.89c2.276-2.096 3.563-5.184 3.563-8.537z" fill="#4285F4"/>
                  <path d="M12.24 24c3.24 0 5.963-1.07 7.95-2.91l-3.89-2.917c-1.08.726-2.457 1.16-4.06 1.16-3.13 0-5.78-2.113-6.73-4.957H1.52v3.09A11.997 11.997 0 0012.24 24z" fill="#34A853"/>
                  <path d="M5.51 14.376a7.19 7.19 0 010-4.752v-3.09H1.52a12.003 12.003 0 000 10.932l3.99-3.09z" fill="#FBBC05"/>
                  <path d="M12.24 7.58c1.77 0 3.36.61 4.61 1.81l3.44-3.44C18.2 3.88 15.48 2.81 12.24 2.81A11.997 11.997 0 001.52 7.534l3.99 3.09c.95-2.844 3.6-4.957 6.73-4.957z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              {loading ? 'Signing up...' : 'Sign up with Google'}
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </>
        )}
        {/* Show Google profile if in Google flow */}
        {location.state?.photoURL && (
          <div className="flex justify-center mb-2">
            <img src={location.state.photoURL} alt="Google profile" className="w-16 h-16 rounded-full border-2 border-purple-300 shadow" />
          </div>
        )}
        {location.state?.displayName && (
          <div className="text-center text-lg font-semibold text-purple-700 mb-2">
            {location.state.displayName}
          </div>
        )}
        {/* Manual Signup Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="input input-bordered input-primary w-full"
            />
          </div>
          <div>
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role-select"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              className="select select-bordered select-primary w-full"
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="input input-bordered input-primary w-full"
              autoComplete="email"
            />
          </div>
          {!isGoogleFlow && (
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="input input-bordered input-primary w-full"
                autoComplete="new-password"
              />
            </div>
          )}
          <div>
            <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="input input-bordered w-full"
              autoComplete="tel"
            />
          </div>
          <div>
            <label htmlFor="signup-photo" className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL (optional)</label>
            <input
              id="signup-photo"
              name="photoURL"
              value={photoURL}
              onChange={e => setPhotoURL(e.target.value)}
              placeholder="Paste a photo URL"
              className="input input-bordered w-full"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full rounded-lg shadow transition hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Signing Up...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
