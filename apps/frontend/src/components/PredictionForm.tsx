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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/predict`, formData);
      setResult(res.data.prediction || 'Prediction received.');
    } catch (error) {
      setResult('Error fetching prediction.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/10 text-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Get Your Horoscope Prediction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black/30 border border-purple-400"
        />
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black/30 border border-purple-400"
        />
        <input
          type="time"
          name="birthTime"
          value={formData.birthTime}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black/30 border border-purple-400"
        />
        <input
          type="text"
          name="location"
          placeholder="Birth Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black/30 border border-purple-400"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold"
        >
          {loading ? 'Loading...' : 'Get Prediction'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-black/20 border border-purple-400 rounded text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
};

export default PredictionForm;