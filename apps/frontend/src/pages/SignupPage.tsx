import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from '../firebase';

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupForm>({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuthSafe(), form.email, form.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: form.fullName });
      await setDoc(doc(getDbSafe(), 'users', user.uid), {
        fullName: form.fullName,
        email: form.email,
        createdAt: new Date().toISOString(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        aria-label="Sign up form"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="mb-4 text-red-600" role="alert">{error}</div>
        )}
        <label htmlFor="fullName" className="block mb-2 font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.fullName}
          onChange={handleChange}
        />
        <label htmlFor="email" className="block mb-2 font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.email}
          onChange={handleChange}
        />
        <label htmlFor="password" className="block mb-2 font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="w-full p-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <div className="mt-4 text-center">
          <span>Already have an account?</span>{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
