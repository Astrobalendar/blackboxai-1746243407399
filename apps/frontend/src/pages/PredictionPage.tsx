import React from 'react';
import { PredictionResult } from '../shared/types/prediction';

interface PredictionPageProps {
  prediction: PredictionResult | null;
}

const PredictionPage: React.FC<PredictionPageProps> = ({ prediction }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Prediction Page</h1>
      
      {prediction ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Prediction Result</h2>
          <div className="space-y-4">
            <p className="text-gray-700">{prediction.prediction}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Make a Prediction</h2>
          <p className="text-gray-600">Please submit your birth data to receive a prediction.</p>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
