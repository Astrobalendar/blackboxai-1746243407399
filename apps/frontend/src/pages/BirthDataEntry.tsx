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
  const [confirmation, setConfirmation] = React.useState<any | null>(null);

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
      // Remove undefined fields before saving
      const cleanedData = Object.fromEntries(
        Object.entries({
          ...data,
          uid: user!.uid,
          createdAt: new Date().toISOString(),
        }).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'birthdata', user!.uid), cleanedData);
      await setDoc(doc(db, 'users', user!.uid), { verified: true }, { merge: true });
      setConfirmation(cleanedData); // Show confirmation UI instead of redirect
    } catch (err) {
      setError('Failed to save birth data.');
    }
    setFormLoading(false);
  };

  const handleProceed = () => {
    if (userRole === 'astrologer') navigate('/dashboard/astrologer');
    else if (userRole === 'student') navigate('/dashboard/student');
    else navigate('/dashboard/client');
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f7f1]">
      <div className="w-full max-w-xl mx-auto">
        {!confirmation ? (
          <>
            <h2 className="text-center font-extrabold text-3xl text-purple-700 mb-6">Enter Your Birth Data</h2>
            <BirthDataForm
              onSubmit={handleSubmit}
              loading={formLoading || loading || birthDataLoading}
              error={error}
              initialData={{
                fullName: user?.displayName || '',
                dateOfBirth: '',
                timeOfBirth: '',
                locationName: '',
                latitude: '',
                longitude: '',
                fullAddress: '',
              }}
            />
          </>
        ) : (
          <div className="glassmorphic p-8 rounded-2xl shadow-xl backdrop-blur-lg bg-white/30 border border-white/30 mt-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Data Saved!</h2>
            <div className="w-full text-left text-lg space-y-2 mb-6">
              <div><span className="font-semibold">Full Name:</span> {confirmation.fullName}</div>
              <div><span className="font-semibold">Date of Birth:</span> {confirmation.dateOfBirth}</div>
              <div><span className="font-semibold">Time of Birth:</span> {confirmation.timeOfBirth}</div>
              <div><span className="font-semibold">Place of Birth:</span> {confirmation.locationName}</div>
              <div><span className="font-semibold">Latitude:</span> {confirmation.latitude}</div>
              <div><span className="font-semibold">Longitude:</span> {confirmation.longitude}</div>
              <div><span className="font-semibold">Full Address:</span> {confirmation.fullAddress}</div>
            </div>
            <button
              className="w-full bg-yellow-400 text-purple-900 font-extrabold px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-yellow-400/50 disabled:opacity-60 disabled:cursor-not-allowed text-xl tracking-wide mt-4 border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onClick={handleProceed}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthDataEntry;
