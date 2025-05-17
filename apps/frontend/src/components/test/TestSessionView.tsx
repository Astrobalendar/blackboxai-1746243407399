import React, { useState, useEffect, FC, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressBar } from '../ui/ProgressBar';
import { db } from '../../lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import styles from './TestSessionView.module.css';

interface PlanetPosition {
  name: string;
  house: number;
  sign: string;
  degree: number;
}

interface ChartData {
  rasi: PlanetPosition[];
  navamsa: PlanetPosition[];
  [key: string]: any;
}

interface TestSessionViewProps {
  onComplete: (data?: ChartData) => void;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

interface Step {
  title: string;
  description: string;
}

const TestSessionView: FC<TestSessionViewProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    locationName: '',
    latitude: 0,
    longitude: 0
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps: Step[] = [
    { title: 'Personal Information', description: 'Enter your basic details' },
    { title: 'Birth Details', description: 'Enter your birth information' },
    { title: 'Generate Horoscope', description: 'Processing your chart' },
    { title: 'Results', description: 'View your horoscope' }
  ];

  useEffect(() => {
    const newProgress = Math.min(100, Math.floor(((currentStep + 1) / steps.length) * 100));
    setProgress(newProgress);
  }, [currentStep, steps.length]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value
    }));
  };

  const checkForDuplicates = async (birthData: FormData) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      const q = query(
        collection(db, 'horoscopes'),
        where('astrologerId', '==', user.uid),
        where('fullName', '==', birthData.fullName),
        where('birthDate', '==', birthData.dateOfBirth)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      throw new Error('Unable to check for duplicates. Please try again.');
    }
  };

  const saveHoroscope = async (chartData: ChartData): Promise<string> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Check for duplicates
      const isDuplicate = await checkForDuplicates(formData);
      if (isDuplicate) {
        throw new Error('A horoscope with these details already exists');
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'horoscopes'), {
        id: uuidv4(),
        astrologerId: user.uid,
        fullName: formData.fullName,
        birthDate: formData.dateOfBirth,
        birthTime: formData.timeOfBirth,
        birthPlace: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        chartData: chartData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSessionId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving horoscope:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (currentStep < steps.length - 2) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === steps.length - 2) {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call to generate chart data
        const response = await axios.post('https://api.vedicastroapi.com/v1/chart', {
          name: formData.fullName,
          date: formData.dateOfBirth,
          time: formData.timeOfBirth,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        
        const chartResponse = response.data;
        setChartData(chartResponse);
        
        // Save to Firestore
        await saveHoroscope(chartResponse);
        
        // Move to results step
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Error generating horoscope:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate horoscope');
      } finally {
        setLoading(false);
      }
    } else {
      onComplete(chartData || undefined);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className={styles.input}
              placeholder="Enter full name"
            />
          </div>
        );
      case 1:
        return (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className={styles.input}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="timeOfBirth">Time of Birth</label>
              <input
                type="time"
                id="timeOfBirth"
                name="timeOfBirth"
                value={formData.timeOfBirth}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="locationName">Birth Place</label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                value={formData.locationName}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="Enter birth place"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Location Coordinates</label>
              <div className={styles.coordinateInputs}>
                <div className={styles.coordinateGroup}>
                  <span>Latitude:</span>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude || ''}
                    onChange={handleInputChange}
                    step="0.000001"
                    className={styles.coordinateInput}
                    placeholder="e.g., 19.0760"
                  />
                </div>
                <div className={styles.coordinateGroup}>
                  <span>Longitude:</span>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude || ''}
                    onChange={handleInputChange}
                    step="0.000001"
                    className={styles.coordinateInput}
                    placeholder="e.g., 72.8777"
                  />
                </div>
              </div>
              <p className={styles.helpText}>
                Tip: You can find coordinates using{' '}
                <a 
                  href="https://www.latlong.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  latlong.net
                </a>
              </p>
            </div>
          </>
        );
      case 2:
        return (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Generating your horoscope...</p>
            {loading && <p className={styles.statusText}>Fetching astrological data...</p>}
          </div>
        );
      case 3:
        return (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✓</div>
            <h3>Horoscope Generated Successfully!</h3>
            <p>Your horoscope has been saved to your account.</p>
            {sessionId && (
              <div className={styles.sessionInfo}>
                <p><strong>Session ID:</strong> {sessionId}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            )}
            <div className={styles.actions}>
              <button 
                type="button" 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => onComplete(chartData || undefined)}
              >
                View Horoscope
              </button>
              <button 
                type="button" 
                className={styles.button}
                onClick={() => setCurrentStep(0)}
              >
                Create Another
              </button>
            </div>
          </div>
        );
      default:
        return <div>Complete!</div>;
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create New Horoscope</h2>
      <ProgressBar progress={progress} />
      
      {error && (
        <div className={styles.errorAlert}>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className={styles.closeButton}
            aria-label="Close error"
          >
            &times;
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContent}>
          {renderStepContent()}
        </div>
        
        {currentStep < steps.length - 1 && (
          <div className={styles.buttonGroup}>
            {currentStep > 0 && (
              <button 
                type="button" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className={`${styles.button} ${styles.secondaryButton}`}
                disabled={loading || saving}
              >
                Back
              </button>
            )}
            <button 
              type="submit" 
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={loading || saving}
            >
              {currentStep === steps.length - 2 ? 'Generate Horoscope' : 'Next'}
              {(loading || saving) && <span className={styles.buttonSpinner}></span>}
            </button>
          </div>
        )}
      </form>
      
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.debugInfo}>
          <h4>Debug Info:</h4>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
          {chartData && <pre>Chart data loaded: {Object.keys(chartData).join(', ')}</pre>}
        </div>
      )}
    </div>
  );
};

export default TestSessionView;
