import React, { useState } from 'react';
import axios from 'axios';

const PredictionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    location: '',
  });

  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post<{ prediction: string }>(`${import.meta.env.VITE_BACKEND_URL}/api/predict`, formData);
      setResult(res.data.prediction || 'Prediction received.');
    } catch (error) {
      setError('Error fetching prediction. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 p-4">
      {!result ? (
        <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Get Your Horoscope Prediction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="e.g. Ravi Kumar"
              className="w-full border rounded px-4 py-2 bg-white text-black"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              className="w-full border rounded px-4 py-2 bg-white text-black"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="HH:MM:SS"
              className="w-full border rounded px-4 py-2 bg-white text-black"
              name="birthTime"
              value={formData.birthTime}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="City, State, Country"
              className="w-full border rounded px-4 py-2 bg-white text-black"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Prediction'}
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </div>
      ) : (
        <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-xl animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Prediction</h2>
          <p className="text-center text-lg">{result}</p>
          <button
            onClick={() => setResult(null)}
            className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 focus:ring focus:ring-purple-300"
          >
            Get Another Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
