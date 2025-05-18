import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'react-toastify';

interface BirthDetails {
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
  latitude: number;
  longitude: number;
  fullName?: string;
}

interface PredictionData {
  // Define your prediction data structure here
  [key: string]: any;
}

const EditPredictionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData>({});
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [notes, setNotes] = useState('');

  // Load prediction data from location state or fetch from API
  useEffect(() => {
    const loadPrediction = async () => {
      try {
        // Check if we have data in location state (from navigation)
        if (location.state?.predictionData || location.state?.birthDetails) {
          setPredictionData(location.state.predictionData || {});
          setBirthDetails(location.state.birthDetails || null);
          setNotes(location.state.predictionData?.notes || '');
        } else {
          // Fetch prediction data from API if not in location state
          // const response = await fetch(`/api/predictions/${id}`);
          // const data = await response.json();
          // setPredictionData(data.predictionData);
          // setBirthDetails(data.birthDetails);
          // setNotes(data.notes || '');
          
          // For demo purposes, we'll use mock data
          const mockData = {
            predictionData: {
              // Add mock prediction data
            },
            birthDetails: {
              dateOfBirth: '1990-01-01',
              timeOfBirth: '12:00',
              locationName: 'New York, NY',
              latitude: 40.7128,
              longitude: -74.0060
            },
            notes: 'Sample prediction notes...'
          };
          
          setPredictionData(mockData.predictionData);
          setBirthDetails(mockData.birthDetails);
          setNotes(mockData.notes);
        }
      } catch (error) {
        console.error('Failed to load prediction:', error);
        toast.error('Failed to load prediction data');
        navigate('/dashboard/astrologer');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPrediction();
    }
  }, [id, user, location.state, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to save predictions');
      return;
    }

    setIsSaving(true);
    
    try {
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/predictions/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     predictionData,
      //     notes,
      //     updatedBy: user.uid
      //   })
      // });
      
      // if (!response.ok) throw new Error('Failed to save prediction');
      
      // Mock success response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Prediction updated successfully');
      navigate('/dashboard/astrologer');
    } catch (error) {
      console.error('Error saving prediction:', error);
      toast.error('Failed to save prediction');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Predictions
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Prediction</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the prediction details and save your changes
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Prediction #{id}
          </h3>
          {birthDetails && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              For {birthDetails.fullName || 'Client'} • {new Date(birthDetails.dateOfBirth).toLocaleDateString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSave} className="divide-y divide-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Birth Details (Read-only) */}
              {birthDetails && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Birth Details</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(birthDetails.dateOfBirth).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Time of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">{birthDetails.timeOfBirth}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Birth Place</dt>
                      <dd className="mt-1 text-sm text-gray-900">{birthDetails.locationName}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Prediction Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Prediction Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    rows={8}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your prediction notes here..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Add detailed notes about the prediction for future reference.
                </p>
              </div>

              {/* Add more prediction fields as needed */}
              
            </div>
          </div>

          <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPredictionPage;
