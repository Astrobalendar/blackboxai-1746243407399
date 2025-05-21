import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { getAuthSafe, getDbSafe } from '../firebase';

const roles = [
  { value: 'astrologer', label: 'Astrologer' },
  { value: 'student', label: 'Student' },
  { value: 'client', label: 'Client' },
];

const RoleSelection: React.FC = () => {
  const [role, setRole] = useState('astrologer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = getAuthSafe().currentUser;
      if (!user) {
        setError('You must be signed in to select a role.');
        setLoading(false);
        return;
      }
      await setDoc(doc(getDbSafe(), 'users', user.uid), {
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
    } catch (err: any) {
      setError(err.message || 'Failed to save role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-container">
      <h2>Select Your Role</h2>
      <form onSubmit={handleRoleSelect}>
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
        <button type="submit" disabled={loading} className="role-select-btn">
          {loading ? 'Saving...' : 'Continue'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default RoleSelection;
