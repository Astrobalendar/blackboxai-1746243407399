import React from 'react';
import PredictionGraphCard, { PredictionResult } from '../components/charts/PredictionGraphCard';
import ExportHoroscopeSheet from '../components/export/ExportHoroscopeSheet';

const mockPrediction: PredictionResult = {
  prediction: 'You will have a prosperous year with strong support from Jupiter and Venus. Focus on your career and health.',
  success: true,
  error: null,
  predictionId: 'mock123',
  sunStrength: 80,
  moonStrength: 65,
  marsStrength: 70,
  mercuryStrength: 60,
  jupiterStrength: 90,
  venusStrength: 85,
  saturnStrength: 55,
  dasaDuration: '2025-2031',
  bhuktiDuration: '2025-2027',
  sookshmaDuration: '2025-2026',
  subLordChain: ['Sun', 'Jupiter', 'Venus'],
};

const mockHoroscopeData = {
  fullName: 'Priya Sharma',
  dob: '1990-06-15',
  tob: '14:35',
  pob: 'Mumbai, India',
  rectifiedTime: '14:37',
  rulingPlanets: {
    dayLord: 'Sun',
    timeLord: 'Venus',
    lagnaLord: 'Mars',
    moonSubLords: ['Jupiter', 'Mercury'],
  },
  prediction: mockPrediction,
  ayanamsa: 'Lahiri',
  astrologerName: 'Astro Guru',
  clientRefNo: 'PRY-2025-01',
};

const ExportHoroscopeExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Export Horoscope Example</h1>
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Prediction Graph Card</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <PredictionGraphCard prediction={mockPrediction} />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Export Horoscope Sheet</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <ExportHoroscopeSheet horoscopeData={mockHoroscopeData} />
        </div>
      </div>
    </div>
  );
};

export default ExportHoroscopeExample;
