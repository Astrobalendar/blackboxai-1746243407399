import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
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
}

const Prediction: React.FC = () => {
  const { horoscopeId } = useParams<{ horoscopeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const editable = false; // Default to non-editable for clients/students
  const db = getFirestore();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: horoscopeId } = useParams<{ id?: string }>();

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
      let horoscopeData: HoroscopeData;
      let isNew = false;
      
      if (existingHoroscopeId && !forceCreate) {
        // Fetch existing horoscope
        const horoscopeRef = doc(db, `users/${user.uid}/horoscopes/${existingHoroscopeId}`);
        const horoscopeSnap = await getDoc(horoscopeRef);
        
        if (!horoscopeSnap.exists()) {
          throw new Error('Horoscope not found');
        }
        
        horoscopeData = { id: horoscopeSnap.id, ...horoscopeSnap.data() } as HoroscopeData;
        
        // Check permissions
        if (horoscopeData.userId && horoscopeData.userId !== user.uid) {
          throw new Error('You do not have permission to view this horoscope');
        }
        
        // Check if chart data is older than 1 day or missing
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const lastFetched = horoscopeData.lastFetched?.toDate ? 
          horoscopeData.lastFetched.toDate() : null;
        
        if (!horoscopeData.chartData || !lastFetched || lastFetched < oneDayAgo) {
          try {
            const chartData = await fetchChartData(birthData);
            await setDoc(
              doc(db, `users/${user.uid}/horoscopes/${horoscopeData.id}`), 
              { 
                chartData,
                lastFetched: serverTimestamp(),
                lastAccessedAt: serverTimestamp()
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
            chartData = existingData.chartData;
            
            // Just update last accessed time
            await setDoc(horoscopeRef, {
              lastAccessedAt: serverTimestamp()
            }, { merge: true });
          }
          
          setPrediction({
            ...existingData,
            id: horoscopeId,
            chartData,
            userId: user.uid
          });
          return;
        }
      }

      // If we get here, we need to create a new horoscope or update an existing one
      const horoscopeData: Omit<HoroscopeData, 'id'> = {
        ...birthData,
        userId: user.uid,
        chartData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastFetched: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        notes: ''
      };

      if (horoscopeId) {
        // Update existing horoscope
        horoscopeRef = doc(db, 'horoscopes', horoscopeId);
        await setDoc(horoscopeRef, {
          ...horoscopeData,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        // Create new horoscope
        horoscopeRef = doc(collection(db, 'horoscopes'));
        await setDoc(horoscopeRef, horoscopeData);
        horoscopeId = horoscopeRef.id;
      }

      // Get the saved document
      if (!horoscopeRef) {
        throw new Error('Failed to create or update horoscope reference');
      }
      
      const docSnap = await getDoc(horoscopeRef);
      if (docSnap.exists()) {
        setPrediction({
          id: docSnap.id,
          ...(docSnap.data() as Omit<HoroscopeData, 'id'>),
          userId: user.uid
        });
      } else {
        throw new Error('Failed to save horoscope data');
      }
    } catch (err) {
      console.error('Error processing horoscope:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process horoscope data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, db, fetchChartData]);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!user) {
          // If user is not authenticated but we have birth data, save it to session storage
          if (location.state?.birthData) {
            sessionStorage.setItem('pendingHoroscope', JSON.stringify(location.state.birthData));
          }
          navigate('/login');
          return;
        }

        if (horoscopeId) {
          // Load existing horoscope
          await processHoroscope({} as BirthData, horoscopeId);
        } else if (location.state?.birthData) {
          // Process new horoscope from form
          await processHoroscope(location.state.birthData);
        } else {
          // No valid data, redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error initializing horoscope:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load horoscope data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user, horoscopeId, location.state, navigate, processHoroscope]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading horoscope data...</p>
          {loadingChart && (
            <p className="text-sm text-gray-500 mt-2">Generating chart data. This may take a moment...</p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 w-full max-w-2xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Error Loading Horoscope</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {chartError && (
                  <p className="mt-2">Chart Error: {chartError}</p>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No horoscope data</h3>
          <p className="mt-1 text-sm text-gray-500">We couldn't find any horoscope data to display.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/new-horoscope')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Horoscope
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the prediction view
  return (
    <div className="min-h-screen bg-gray-50">
      <KPStellarPredictionView
        prediction={{
          ...prediction,
          // Map the data to match the expected format in KPStellarPredictionView
          tob: prediction.timeOfBirth,
          dob: prediction.dateOfBirth,
          pob: prediction.locationName,
          // Add any additional mappings needed for the view
          chartData: prediction.chartData
        }}
        editable={editable}
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        exportFileName={`${prediction.fullName || 'Horoscope'}_${prediction.dateOfBirth || ''}`}
        user={user}
      />
      
      {/* Debug panel - only show in development */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 text-white p-4 text-xs overflow-auto max-h-48">
          <div className="max-w-7xl mx-auto">
            <h4 className="font-mono font-bold mb-2">Debug Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="font-semibold">Horoscope ID:</div>
                <div className="font-mono text-blue-300 break-all">{prediction.id}</div>
              </div>
              <div>
                <div className="font-semibold">User ID:</div>
                <div className="font-mono text-blue-300 break-all">{prediction.userId}</div>
              </div>
              <div>
                <div className="font-semibold">Created:</div>
                <div className="font-mono text-blue-300">
                  {prediction.createdAt?.toDate ? 
                    prediction.createdAt.toDate().toLocaleString() : 
                    'N/A'}
                </div>
              </div>
              {prediction.chartData && (
                <div className="col-span-full">
                  <div className="font-semibold">Chart Data:</div>
                  <div className="font-mono text-green-300 text-xs overflow-auto max-h-20">
                    {JSON.stringify(prediction.chartData, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;
