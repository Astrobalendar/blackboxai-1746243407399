import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  DocumentReference
} from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';
import { KPStellarPredictionView } from '../components/prediction/KPStellarPredictionView';
import { toast } from 'react-toastify';
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CHART_DATA_ENDPOINT = `${API_BASE_URL}/api/v1/chart-data`;

export interface BirthData {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface HoroscopeData extends BirthData {
  id: string;
  userId: string;
  chartData?: ChartData;
  createdAt: any;
  updatedAt: any;
  lastFetched?: any;
  notes?: string;
}

interface ChartData {
  // Add chart data properties here
  [key: string]: any;
}

// Extend the Location type to include state
interface LocationState {
  from?: string;
  message?: string;
  pendingHoroscope?: BirthData;
}

const Prediction: React.FC = () => {
  const { id: horoscopeId } = useParams<{ id?: string }>();
  const location = useLocation() as ReturnType<typeof useLocation> & { state?: LocationState };
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const editable = false; // Default to non-editable for clients/students
  const db = getFirestore();

  // Fetch chart data from backend API
  const fetchChartData = useCallback(async (birthData: BirthData): Promise<ChartData> => {
    try {
      setLoadingChart(true);
      setChartError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      const response = await axios.post(CHART_DATA_ENDPOINT, {
        ...birthData,
        userId: user.uid
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (!response.data) {
        throw new Error('No chart data received');
      }

      return response.data as ChartData;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chart data';
      setChartError(errorMessage);
      toast.error('Failed to load chart data. Please try again later.');
      throw error;
    } finally {
      setLoadingChart(false);
    }
  }, [user]);

  // Process and save horoscope data
  const processHoroscope = useCallback(async (birthData: BirthData, existingHoroscopeId?: string, forceCreate = false) => {
    if (!user) {
      sessionStorage.setItem('pendingHoroscopeReturnUrl', window.location.pathname);
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Please log in to view this prediction.',
          pendingHoroscope: birthData
        } 
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    setChartError(null);

    try {
      let horoscopeRef: DocumentReference;
      let currentHoroscopeId = existingHoroscopeId;
      let chartData: ChartData | null = null;
      
      if (currentHoroscopeId && !forceCreate) {
        // Fetch existing horoscope
        horoscopeRef = doc(db, 'horoscopes', currentHoroscopeId);
        const horoscopeSnap = await getDoc(horoscopeRef);
        
        if (!horoscopeSnap.exists()) {
          throw new Error('Horoscope not found');
        }
        
        const existingData = { id: horoscopeSnap.id, ...horoscopeSnap.data() } as HoroscopeData;
        
        // Check permissions
        if (existingData.userId && existingData.userId !== user.uid) {
          throw new Error('You do not have permission to view this horoscope');
        }
        
        // Check if chart data is older than 1 day or missing
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const lastFetched = existingData.lastFetched?.toDate ? 
          existingData.lastFetched.toDate() : null;
        
        if (!existingData.chartData || !lastFetched || lastFetched < oneDayAgo) {
          try {
            chartData = await fetchChartData(birthData);
            await setDoc(horoscopeRef, { 
              chartData,
              lastFetched: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (chartError) {
            console.error('Error updating chart data:', chartError);
            // Continue with existing data if available
            if (existingData.chartData) {
              chartData = existingData.chartData;
            } else {
              throw new Error('Failed to generate chart data');
            }
          }
        } else {
          // Use existing chart data
          chartData = existingData.chartData || null;
          
          // Just update last accessed time
          await setDoc(horoscopeRef, {
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        
        setPrediction({
          ...existingData,
          id: currentHoroscopeId,
          chartData: chartData || undefined,
          userId: user.uid
        });
        return;
      }

      // If we get here, we need to create a new horoscope
      chartData = await fetchChartData(birthData);
      const newHoroscopeData: Omit<HoroscopeData, 'id'> = {
        ...birthData,
        userId: user.uid,
        chartData: chartData || undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastFetched: serverTimestamp(),
        notes: ''
      };

      // Create new horoscope
      horoscopeRef = doc(collection(db, 'horoscopes'));
      await setDoc(horoscopeRef, newHoroscopeData);
      currentHoroscopeId = horoscopeRef.id;

      // Update the URL with the new horoscope ID if this was a new creation
      if (!existingHoroscopeId) {
        navigate(`/prediction/${currentHoroscopeId}`, { replace: true });
      }

      setPrediction({
        ...newHoroscopeData,
        id: currentHoroscopeId
      });
    } catch (err) {
      console.error('Error processing horoscope:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process horoscope';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, navigate, db, fetchChartData]);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        if (location.state?.pendingHoroscope) {
          // Process pending horoscope from login redirect
          await processHoroscope(location.state.pendingHoroscope);
        } else if (horoscopeId) {
          // Fetch existing horoscope
          const horoscopeRef = doc(db, 'horoscopes', horoscopeId);
          const horoscopeSnap = await getDoc(horoscopeRef);
          
          if (horoscopeSnap.exists()) {
            const data = { id: horoscopeSnap.id, ...horoscopeSnap.data() } as HoroscopeData;
            await processHoroscope(data, horoscopeId);
          } else {
            throw new Error('Horoscope not found');
          }
        } else if (location.state?.birthData) {
          // Process new horoscope from form submission
          await processHoroscope(location.state.birthData);
        } else {
          // No valid data to process
          setError('No horoscope data provided');
          setLoading(false);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize horoscope';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    initialize();
  }, [horoscopeId, location.state, db, processHoroscope]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading horoscope data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No prediction data
  if (!prediction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">No horoscope data available</p>
          <button
            onClick={() => navigate('/new-horoscope')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Horoscope
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KPStellarPredictionView
        prediction={{
          ...prediction,
          birthData: {
            fullName: prediction.fullName,
            dateOfBirth: prediction.dateOfBirth,
            timeOfBirth: prediction.timeOfBirth,
            locationName: prediction.locationName,
            latitude: prediction.latitude,
            longitude: prediction.longitude,
            timezone: prediction.timezone
          },
          chartData: prediction.chartData
        }}
        loading={loadingChart}
        error={chartError}
        editable={editable}
        onSave={editable ? (data) => {
          // Handle save if editable
          console.log('Save horoscope data:', data);
          toast.success('Horoscope updated successfully');
        } : undefined}
      />
    </div>
  );
};

export default Prediction;
