import React, { useState } from 'react';
import PredictionForm from '../components/PredictionForm';

const PredictionPage: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePrediction = async (formData: any) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setResult('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-600 to-blue-500 p-4">
      <div className="bg-white/10 text-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Get Your Horoscope Prediction</h2>
        <PredictionForm onSubmit={handlePrediction} loading={loading} />
      </div>
    </div>
  );
};

export default PredictionPage;