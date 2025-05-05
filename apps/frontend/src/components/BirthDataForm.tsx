import React, { useState, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const BirthDataForm: React.FC = () => {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);

  const backend = import.meta.env.VITE_BACKEND_URL;

  const fetchPrediction = async (data: { date: string; time?: string; place?: string }) => {
    try {
      const response = await axios.post(`${backend}/api/predict`, data);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction('');

    try {
      const data = await fetchPrediction({
        date: dateOfBirth,
        time: timeOfBirth,
        place: placeOfBirth,
      });
      setPrediction(data.prediction);
    } catch {
      setError('⚠️ Could not fetch prediction. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (pdfRef.current) {
      const options = {
        margin: 1,
        filename: 'prediction.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
      html2pdf().set(options).from(pdfRef.current).save();
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Birth Data Prediction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">
            Date of Birth:
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </label>
        </div>
        <div>
          <label className="block mb-2">
            Time of Birth (optional):
            <input
              type="time"
              value={timeOfBirth}
              onChange={(e) => setTimeOfBirth(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </label>
        </div>
        <div>
          <label className="block mb-2">
            Place of Birth (optional):
            <input
              type="text"
              value={placeOfBirth}
              onChange={(e) => setPlaceOfBirth(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., New York, USA"
            />
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Get Prediction
        </button>
      </form>

      {loading && <p className="text-blue-500 mt-4">🔄 Loading your prediction...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {prediction && !loading && (
        <div ref={pdfRef} className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Your Prediction:</h3>
          <p>{prediction}</p>
          <button
            onClick={exportToPDF}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default BirthDataForm;