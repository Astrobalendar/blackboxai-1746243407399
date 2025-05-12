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



  // Only use BirthDataForm for birth data entry, and save to Firestore on submit
  const handleBirthDataSubmit = async (data: any) => {
    setError(null);
    setPageLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      // Save birth data to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...data }, { merge: true });
      setInitialData(data);
      setStep(2); // Proceed to prediction
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
    } else {
      navigate('/');
    }
  };

  const steps = [
    { title: "Personal Info", completed: step >= 1 },
    { title: "Prediction", completed: step >= 2 },
    { title: "Export", completed: step >= 3 }
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

      {step === 2 && prediction && (
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

      {step === 3 && prediction && (
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
