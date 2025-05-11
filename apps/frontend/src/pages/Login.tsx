import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';
import '../styles/login.css';

// WARNING: Always import context and firebase in the correct order to avoid circular dependencies and TDZ errors.
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // All hooks MUST be at the top level, before any return or conditional
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [signInLoading, setSignInLoading] = React.useState(false);
  const [signInErrorMsg, setSignInErrorMsg] = React.useState<string | null>(null);

  // Debug: log mount and user state
  React.useEffect(() => {
    console.log("Login.tsx mounted");
    console.log("user from useAuth:", user);
  }, [user]);

  // Step 1: Show loading indicator while auth is initializing
  if (loading) {
    return <div>Loading...</div>;
  }

  // Step 2: Prompt login if user is not authenticated

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
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
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
          className="w-full bg-white border border-gray-300 text-yellow-700 py-2 rounded font-semibold hover:bg-yellow-50 transition flex items-center justify-center"
          disabled={signInLoading}
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
          {signInLoading ? 'Signing in with Google...' : 'Sign in with Google'}
        </button>
        {signInErrorMsg && (
          <div className="text-red-500 text-center mt-2 font-medium">{signInErrorMsg}</div>
        )}
        <div className="mt-4 text-center">
          <span className="text-gray-700 font-medium">Don't have an account?</span>
          <button
            onClick={() => navigate('/signup')}
            className="ml-2 text-yellow-700 font-bold hover:underline"
            type="button"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );

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

  if (user && typeof user !== "object") {
    console.error("User is malformed:", user);
    return <div>There was a problem with your session. Please refresh.</div>;
  }

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <button onClick={() => navigate('/birth-data')}>Go to Birth Data</button>
      </div>
    );
  }

  // Main login form and Google sign-in UI
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
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
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
          className="w-full bg-white border border-gray-300 text-yellow-700 py-2 rounded font-semibold hover:bg-yellow-50 transition flex items-center justify-center"
          disabled={signInLoading}
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
          {signInLoading ? 'Signing in with Google...' : 'Sign in with Google'}
        </button>
        {signInErrorMsg && (
          <div className="text-red-500 text-center mt-2 font-medium">{signInErrorMsg}</div>
        )}
        <div className="mt-4 text-center">
          <span className="text-gray-700 font-medium">Don't have an account?</span>
          <button
            onClick={() => navigate('/signup')}
            className="ml-2 text-yellow-700 font-bold hover:underline"
            type="button"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}


export default Login;
