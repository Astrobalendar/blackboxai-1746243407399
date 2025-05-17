import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useBirthData } from '../context/BirthDataContext';
import BirthDataForm from '../components/BirthDataForm';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { generateReferenceId } from '../utils/referenceId';

const NewHoroscope: React.FC = () => {
  const { user, loading } = useAuth();
  const { birthDataComplete, loading: birthDataLoading } = useBirthData();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || birthDataLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!birthDataComplete) {
      navigate('/birth-data');
      return;
    }
  }, [user, loading, birthDataComplete, birthDataLoading, navigate]);

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingDocId, setExistingDocId] = useState<string | null>(null);

const handleBirthDataSubmit = async (data: any) => {
    setError(null);
    setExistingDocId(null);
    setFormLoading(true);
    try {
      // Duplicate check
      const horoscopesRef = collection(db, 'horoscopes');
      const q = query(
        horoscopesRef,
        where('fullName', '==', data.fullName),
        where('dateOfBirth', '==', data.dateOfBirth),
        where('timeOfBirth', '==', data.timeOfBirth),
        where('locationName', '==', data.locationName)
      );
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (err) {
        setError('Unable to check for duplicates. Please try again.');
        setFormLoading(false);
        return;
      }
      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        setExistingDocId(docId);
        setError('This horoscope already exists.');
        setFormLoading(false);
        return;
      }
      // Store data in Firestore with timestamp
      let docRef;
      // Generate referenceId using utility
      try {
        // Import the utility at the top
        // import { generateReferenceId } from '../utils/referenceId';
        docRef = await addDoc(horoscopesRef, {
          ...data,
          referenceId: generateReferenceId(data.fullName),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        setError('Failed to create horoscope. Please try again.');
        setFormLoading(false);
        return;
      }
      navigate(`/prediction/${docRef.id}`);
    } finally {
      setFormLoading(false);
    }
  };



  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200">
      <div className="w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl p-10 border border-yellow-200 flex flex-col gap-6">
        <h1 className="text-5xl font-black text-yellow-900 mb-4 text-center tracking-tight drop-shadow-lg">New Horoscope Entry</h1>
        <div className="mb-4 text-gray-800 text-center text-lg font-medium">
          Enter your birth details below to generate your personalized KP Stellar Horoscope prediction.<br />
          <span className="text-yellow-700 text-base">All fields are required.</span>
        </div>
        <div className="rounded-2xl shadow-xl bg-white/80 p-6 md:p-8 border border-yellow-100">
          <BirthDataForm
            onSubmit={handleBirthDataSubmit}
            loading={formLoading}
            error={error}
          />
          {formLoading && (
            <div className="mt-4 text-center text-yellow-700 font-medium">Checking for duplicates...</div>
          )}
          {error && (
            <div className="mt-4 text-center text-red-600 font-semibold">
              {error}
              {existingDocId && (
                <div className="mt-2">
                  <button
                    className="underline text-yellow-700 hover:text-yellow-900 font-bold"
                    onClick={() => navigate(`/prediction/${existingDocId}`)}
                  >
                    View Existing
                  </button>
                </div>
              )}
            </div>
          )}
          {error && (
  <div className="mt-4 text-center text-red-600 font-semibold">
    {error}
    {existingDocId && (
      <div className="mt-2">
        <button
          className="underline text-yellow-700 hover:text-yellow-900 font-bold"
          onClick={() => navigate(`/prediction/${existingDocId}`)}
        >
          View Existing
        </button>
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default NewHoroscope;
