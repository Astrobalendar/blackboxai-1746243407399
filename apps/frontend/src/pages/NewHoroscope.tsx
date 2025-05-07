import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BirthDataForm from '../components/BirthDataForm';
import PredictionResult from '../components/PredictionResult';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { AstrologicalPrediction } from '../types/astrology';
import { logError } from '../services/errorLogger';

const NewHoroscope: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    latitude: '',
    longitude: '',
    timeZone: '',
  });
  const [prediction, setPrediction] = useState<AstrologicalPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const handleBirthDataSubmit = async (data: any) => {
    setFormData(data);
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      const response = await Promise.race([
        fetch('/api/prediction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        )
      ]);

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const result = await response.json();
      setPrediction(result);
      setStep(3);
      setShowExport(true);
    } catch (err) {
      logError(err as Error, {
        userId: data.name,
        data: {
          request: data,
          response: err instanceof Error ? err.message : 'Unknown error'
        }
      });
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
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
