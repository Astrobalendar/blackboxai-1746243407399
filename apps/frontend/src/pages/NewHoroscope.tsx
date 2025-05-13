import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useBirthData } from '../context/BirthDataContext';
import BirthDataForm from '../components/BirthDataForm';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import PredictionResult from '../components/PredictionResult';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { PredictionInput } from '@shared/types/prediction';
import { getPrediction } from '@shared/api/predict';
import { logError } from '../services/errorLogger';
import { createErrorNotification } from '../components/notifications';

import { useRequireBirthData } from '../components/useRequireBirthData';

const NewHoroscope: React.FC = () => {
  const { user, loading } = useAuth();
  const { birthDataComplete, loading: birthDataLoading } = useBirthData();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || birthDataLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!birthDataComplete) {
      navigate('/birth-data');
      return;
    }
  }, [user, loading, birthDataComplete, birthDataLoading, navigate]);

  const [step, setStep] = useState(1);
  const [initialData, setInitialData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<import('@shared/types/prediction').PredictionResult | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Only use BirthDataForm for birth data entry, and save to Firestore on submit
  const handleBirthDataSubmit = async (data: any) => {
    setError(null);
    setPageLoading(true);
    try {
      // Instead of saving now, show preview first
      setPreviewData(data);
      setStep(2); // Go to preview step
    } catch (err) {
      setError('Failed to process birth data.');
    }
    setPageLoading(false);
  };

  // Confirm and save to Firestore, then get prediction
  const handleConfirmPreview = async () => {
    setError(null);
    setPageLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const cleanedData = Object.fromEntries(
        Object.entries(previewData).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'users', user.uid), cleanedData, { merge: true });
      setInitialData(previewData);
      setStep(3); // Proceed to prediction
    } catch (err) {
      setError('Failed to save birth data.');
    }
    setPageLoading(false);
  };

  const handleBack = () => {
    setError(null);
    if (step === 3) {
      setStep(2);
      setShowExport(false);
    } else if (step === 2) {
      setStep(1);
    } else {
      navigate('/');
    }
  };

  const steps = [
    { title: "Personal Info", completed: step >= 1 },
    { title: "Preview", completed: step >= 2 },
    { title: "Prediction", completed: step >= 3 },
    { title: "Export", completed: step >= 4 }
  ];

  return (
    <Container className="mt-5">
      <div className="steps-container mb-4">
        {steps.map((stepItem, index) => (
          <div
            key={index}
            className={`step ${stepItem.completed ? 'completed' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{stepItem.title}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="form-container">
          <BirthDataForm
            onSubmit={handleBirthDataSubmit}
            loading={loading}
            error={error}
            initialData={initialData}
          />
        </div>
      )}

      {step === 2 && previewData && (
        <div className="preview-container max-w-xl mx-auto mt-12 mb-12 bg-gradient-to-br from-purple-950/90 to-purple-900/80 rounded-3xl shadow-2xl p-10 space-y-10 border border-purple-800 backdrop-blur-lg font-[system-ui,sans-serif] text-white">
          <h2 className="text-3xl font-bold mb-4">Confirm Your Details</h2>
          <div className="mb-2"><strong>Full Name:</strong> {previewData.fullName}</div>
          <div className="mb-2"><strong>Date of Birth:</strong> {previewData.dateOfBirth}</div>
          <div className="mb-2"><strong>Time of Birth:</strong> {previewData.timeOfBirth}</div>
          <div className="mb-2"><strong>City:</strong> {previewData.city}</div>
          <div className="mb-2"><strong>State:</strong> {previewData.state}</div>
          <div className="mb-2"><strong>Country:</strong> {previewData.country}</div>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="bg-yellow-400 text-purple-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-all duration-200"
              onClick={handleConfirmPreview}
              disabled={pageLoading}
            >
              {pageLoading ? 'Loading...' : 'Confirm & Get Prediction'}
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200"
              onClick={() => setStep(1)}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {step === 3 && prediction && (
        <div className="prediction-container">
          <PredictionResult
            prediction={prediction}
            showExport={false}
            onBack={handleBack}
            onError={(err) => {
              setError(err);
              setStep(1);
            }}
          />
        </div>
      )}

      {step === 4 && prediction && (
        <div className="export-container">
          <PredictionResult
            prediction={prediction}
            showExport={true}
            onBack={handleBack}
            onError={(err) => {
              setError(err);
              setStep(2);
            }}
          />
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="alert alert-danger">
            {error}
          </div>
        </div>
      )}
    </Container>
  );
};

export default NewHoroscope;
