import React from 'react';
import BirthDataForm from '../components/BirthDataForm';

const PredictionPage: React.FC = () => {
  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Get Your Horoscope Prediction</h1>
      <BirthDataForm />
    </div>
  );
};

export default PredictionPage;