import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BirthDataForm from '../components/BirthDataForm';

const NewHoroscopePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      // Here you can add logic to save data or call an API if needed
      navigate('/prediction');
    } catch (err) {
      setError('Failed to create horoscope. Please try again.');
    } finally {
      setLoading(false);
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
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
          {error && <div className="mt-4 text-center text-red-600 font-semibold">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default NewHoroscopePage;
