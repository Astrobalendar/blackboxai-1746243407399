import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useBirthData } from '../context/BirthDataContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BirthDataForm from '../components/BirthDataForm';

const BirthDataEntry: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const { birthDataComplete, loading: birthDataLoading } = useBirthData();
  const [formLoading, setFormLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Redirect if not logged in or birth data already complete
  React.useEffect(() => {
    if (loading || birthDataLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (birthDataComplete) {
      if (userRole === 'astrologer') navigate('/dashboard/astrologer');
      else if (userRole === 'student') navigate('/dashboard/student');
      else navigate('/dashboard/client');
    }
  }, [user, userRole, loading, birthDataLoading, birthDataComplete, navigate]);

  // Submission handler for canonical BirthDataForm
  const handleSubmit = async (data: any) => {
    setError(null);
    setFormLoading(true);
    try {
      await setDoc(doc(db, 'birthdata', user!.uid), {
        ...data,
        uid: user!.uid,
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', user!.uid), { verified: true }, { merge: true });
      // Redirect
      if (userRole === 'astrologer') navigate('/dashboard/astrologer');
      else if (userRole === 'student') navigate('/dashboard/student');
      else navigate('/dashboard/client');
    } catch (err) {
      setError('Failed to save birth data.');
    }
    setFormLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f7f1' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, color: '#7c3aed', marginBottom: 24 }}>Enter Your Birth Data</h2>
        <BirthDataForm
          onSubmit={handleSubmit}
          loading={formLoading || loading || birthDataLoading}
          error={error}
          initialData={{
            fullName: user?.displayName || '',
            email: user?.email || '',
          }}
        />
      </div>
    </div>
  );
};

export default BirthDataEntry;
