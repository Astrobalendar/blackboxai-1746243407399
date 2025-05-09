import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import { fetchPrediction } from "../services/api";
import BirthDataForm from './BirthDataForm';
import { useAuth } from '../context/AuthProvider';
import { fetchBirthProfile, saveBirthProfile } from '../utils/birthProfileFirestore';

type HoroscopeData = {
  name: string;
  date: string;
  time: string;
  location: string;
};

interface NewHoroscopeProps {
  onPrediction?: (data: any) => void;
}

const NewHoroscope: React.FC<NewHoroscopeProps> = ({ onPrediction }) => {
  const { user, userRole } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const birthProfile = await fetchBirthProfile(user.uid);
        if (birthProfile) {
          setPrefilledData(birthProfile);
          setEditMode(false);
        } else {
          setEditMode(true); // No data, allow entry
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleBirthDataSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        await saveBirthProfile(user.uid, formData);
        setPrefilledData(formData);
        setEditMode(false);
      }
      const response = await fetchPrediction(formData, user, userRole);
      if (response.prediction || response.prediction_id) {
        setResult(JSON.stringify(response.prediction, null, 2));
        setPredictionId(response.prediction_id || response.predictionId || null);
        if (onPrediction) {
          onPrediction(response.prediction);
        }
      } else if (response.success) {
        setResult(JSON.stringify(response.data, null, 2));
        setPredictionId(response.predictionId || null);
        if (onPrediction) {
          onPrediction(response.data);
        }
      } else {
        throw new Error(response.error || "Prediction failed");
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Horoscope Report", 10, 10);
    const birthData = prefilledData || {};
    doc.text(`Name: ${birthData.name || ''}`, 10, 20);
    doc.text(`Date: ${birthData.dateOfBirth || ''}`, 10, 30);
    doc.text(`Time: ${birthData.timeOfBirth || ''}`, 10, 40);
    doc.text(`Location: ${birthData.city || ''}, ${birthData.district || ''}, ${birthData.state || ''}`, 10, 50);
    doc.text("Prediction Result:", 10, 60);
    doc.text(result || "No result", 10, 70);
    if (predictionId) {
      doc.text(`Prediction ID: ${predictionId}`, 10, 80);
    }
    doc.save("horoscope.pdf");
  };

  return (
    <div className="new-horoscope space-y-8">
      {user && (
        <div className="mb-4 text-lg text-purple-300">Welcome, {user.displayName || user.email}!</div>
      )}
      {prefilledData && !editMode ? (
        <div className="bg-purple-900/40 p-4 rounded-lg mb-4">
          <div className="mb-2">Your birth data is saved:</div>
          <pre className="text-purple-200 text-sm whitespace-pre-wrap">{JSON.stringify(prefilledData, null, 2)}</pre>
          <button className="mt-2 px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600" onClick={() => setEditMode(true)}>
            Edit Birth Info
          </button>
        </div>
      ) : (
        <BirthDataForm
          onSubmit={handleBirthDataSubmit}
          loading={loading}
          error={error}
          initialData={prefilledData}
        />
      )}
      {result && (
        <div className="result-section mt-6">
          <h3 className="text-lg font-bold mb-2">Prediction Result</h3>
          <pre className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
            {result}
          </pre>
          {predictionId && (
            <div className="mb-4">
              <strong>Prediction ID:</strong> {predictionId}
            </div>
          )}
          <button onClick={handleExport} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Export as PDF</button>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default NewHoroscope;
