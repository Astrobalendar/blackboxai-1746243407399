import React, { useState } from 'react';
import { PredictionResult, PredictionInput } from '@shared/types/prediction';
import { fetchPrediction } from '../services/api';

interface TestPredictionProps {
  prediction: PredictionResult | null;
}

const TestPrediction: React.FC<TestPredictionProps> = ({ prediction }) => {
  const [testPrediction, setTestPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPrediction({
        name: 'Test User',
        birthDate: '2000-01-01',
        birthTime: '12:00',
        location: 'Test Location'
      } as PredictionInput);

      if (response.success && response.prediction) {
        const predictionResult: PredictionResult = {
          prediction: response.prediction,
          predictionId: response.predictionId || 'test-id',
          error: null,
          success: true
        };
        setTestPrediction(predictionResult);
      } else {
        setError('Failed to get valid prediction response');
      }
    } catch (err) {
      setError('Failed to generate test prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Prediction</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={handleTestPrediction}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Generate Test Prediction'}
        </button>

        {error && (
          <div className="mt-4 text-red-500">{error}</div>
        )}

        {testPrediction && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h2 className="text-lg font-semibold mb-2">Test Prediction Result</h2>
            <p className="text-gray-700">{testPrediction.prediction}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPrediction;
