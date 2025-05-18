import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';
import '../styles/login.css';

// WARNING: Always import context and firebase in the correct order to avoid circular dependencies and TDZ errors.
interface LocationState {
  forceCreate?: boolean;
  formData?: any;
  checkForDuplicate?: boolean;
  pendingHoroscopeData?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;
  const { user, loading } = useAuth();

  // All hooks MUST be at the top level, before any return or conditional
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [signInLoading, setSignInLoading] = React.useState(false);
  const [signInErrorMsg, setSignInErrorMsg] = React.useState<string | null>(null);

  // Handle redirection after successful authentication
  React.useEffect(() => {
    if (!loading && user) {
      // Check for pending horoscope data in session storage
      const pendingHoroscopeData = sessionStorage.getItem('pendingHoroscopeData');
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      
      if (pendingHoroscopeData) {
        try {
          const horoscopeData = JSON.parse(pendingHoroscopeData);
          sessionStorage.removeItem('pendingHoroscopeData');
          
          // Check if we need to force create a new horoscope
          const forceCreate = locationState?.forceCreate || false;
          
          if (forceCreate) {
            navigate('/new-horoscope', { 
              state: { 
                formData: horoscopeData,
                forceCreate: true
              } 
            });
          } else {
            // Check for duplicates and show warning if needed
            navigate('/new-horoscope', { 
              state: { 
                formData: horoscopeData,
                checkForDuplicate: true
              } 
            });
          }
          return;
        } catch (err) {
          console.error('Error processing pending horoscope data:', err);
        }
      }
      
      // Default redirect if no pending horoscope data
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/dashboard/client');
      }
    }
  }, [user, loading, navigate, locationState]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    // Prevent login form flash
    return null;
  }

  // Step 2: Prompt login if user is not authenticated (but always call all hooks)

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user doc exists, create if not
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        // New Google user, redirect to signup for role selection
        navigate('/signup', { 
          state: { 
            email: user.email, 
            displayName: user.displayName, 
            photoURL: user.photoURL,
            // Preserve any pending horoscope data
            pendingHoroscopeData: sessionStorage.getItem('pendingHoroscopeData')
          } 
        });
        return;
      }
      
      // Check for pending horoscope data after successful login
      const pendingHoroscopeData = sessionStorage.getItem('pendingHoroscopeData');
      if (pendingHoroscopeData) {
        try {
          const horoscopeData = JSON.parse(pendingHoroscopeData);
          sessionStorage.removeItem('pendingHoroscopeData');
          
          // Check if we need to force create a new horoscope
          const forceCreate = locationState?.forceCreate || false;
          
          if (forceCreate) {
            navigate('/new-horoscope', { 
              state: { 
                formData: horoscopeData,
                forceCreate: true
              } 
            });
            return;
          } else {
            // Check for duplicates and show warning if needed
            navigate('/new-horoscope', { 
              state: { 
                formData: horoscopeData,
                checkForDuplicate: true
              } 
            });
            return;
          }
        } catch (err) {
          console.error('Error processing pending horoscope data:', err);
        }
      }
      
      // Default redirect based on role if no pending horoscope data
      const role = userDocSnap.data()?.role;
      if (role === 'astrologer') {
        navigate('/dashboard/astrologer');
      } else if (role === 'student') {
        navigate('/dashboard/student');
      } else {
        navigate('/dashboard/client');
      }
    } catch (error) {
      setSignInErrorMsg('Google sign-in failed. Please try again.');
      console.error(error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Sign in to AstroBalendar</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (loginError) setLoginError(null);
                if (signInErrorMsg) setSignInErrorMsg(null);
              }}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (loginError) setLoginError(null);
                if (signInErrorMsg) setSignInErrorMsg(null);
              }}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
          <button
            type="submit"
            className="w-full bg-yellow-700 text-white py-2 rounded font-semibold hover:bg-yellow-800 transition"
            disabled={loginLoading}
          >
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="my-4 text-center text-gray-500">or</div>
        <button
          onClick={async () => {
            setSignInLoading(true);
            setSignInErrorMsg(null);
            try {
              await handleGoogleSignIn();
            } catch (e: any) {
              setSignInErrorMsg('Google sign-in failed. Please try again.');
            } finally {
              setSignInLoading(false);
            }
          }}
          className={styles.googleSignInButton}
          disabled={signInLoading}
        >
          <span className={styles.googleSignInFlex}>
            <img src="/google-icon.svg" alt="Google" className={styles.googleIcon} />
            <span className={styles.googleSignInText}>{signInLoading ? 'Signing in with Google...' : 'Sign in with Google'}</span>
          </span>
        </button>
        {signInErrorMsg && (
          <div className={styles.signInErrorMsg}>{signInErrorMsg}</div>
        )}
        <div className={styles.signUpLink}>
          <span>Don't have an account?</span>
          <button
            onClick={() => navigate('/signup')}
            className={styles.signUpButton}
            type="button"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

import styles from './Login.module.css';

export default Login;
