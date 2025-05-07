import React, { useState } from 'react';
import { PredictionResponse } from '../services/api';
import PredictionResult from '../components/PredictionResult';

const mockPrediction: PredictionResponse = {
  success: true,
  data: {
    moonSign: 'Cancer',
    ascendant: 'Leo',
    sunSign: 'Gemini',
    nakshatra: 'Pushya',
    rasi: 'Karkataka',
    dasa: 'Venus',
    subDasa: 'Mercury',
    planetaryStrength: 'Strong',
    career: 'Creative fields, communications',
    health: 'Good overall health with some digestive issues',
    relationships: 'Strong family bonds, stable partnerships'
  }
};

const mockError: PredictionResponse = {
  success: false,
  error: 'Failed to fetch prediction data. Please try again later.'
};

const TestPrediction: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [showMock, setShowMock] = useState(true);

  const handleError = () => {
    setShowError(true);
    setShowMock(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black text-white font-sans p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-4">
          <button
            onClick={handleError}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Simulate Error
          </button>
        </div>
        
        {showMock ? (
          <PredictionResult 
            data={mockPrediction.data} 
            onBack={() => window.history.back()} 
            onError={handleError}
          />
        ) : (
          <PredictionResult 
            data={mockError.data} 
            onBack={() => window.history.back()} 
          />
        )}
      </div>
    </div>
  );
};

export default TestPrediction;
