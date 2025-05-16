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
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl p-8 border border-yellow-100">
        <h1 className="text-4xl font-extrabold text-yellow-900 mb-8 text-center tracking-tight drop-shadow">New Horoscope Entry</h1>
        <p className="mb-6 text-gray-700 text-center text-base">Fill in your birth details below to generate your personalized KP Stellar Horoscope prediction.</p>
        <BirthDataForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
        {error && <div className="mt-4 text-center text-red-600 font-semibold">{error}</div>}
      </div>
    </div>
  );
};

export default NewHoroscopePage;
