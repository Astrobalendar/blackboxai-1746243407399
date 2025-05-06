import React from 'react';
import BirthDataForm from '../components/BirthDataForm';
import PredictionForm from '../components/PredictionForm';

const PredictionPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 to-indigo-900 text-white">
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Get Your Horoscope Prediction</h1>
        <BirthDataForm />
      </div>
      <PredictionForm />
    </div>
  );
};

export default PredictionPage;