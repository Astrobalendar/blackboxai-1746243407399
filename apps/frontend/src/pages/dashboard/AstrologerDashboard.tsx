import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import PredictionHistoryTable, { PredictionHistoryEntry } from '../../components/PredictionHistoryTable';
import { useRequireBirthData } from '../../components/useRequireBirthData';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';

const AstrologerDashboard: React.FC = () => {
  const { checking } = useRequireBirthData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // In a real app, you would fetch this from your API
        // const res = await fetch(`/api/astrologer/${user.uid}/predictions`);
        // const data = await res.json();
        
        // Mock data for demonstration
        const mockData: PredictionHistoryEntry[] = [
          {
            id: '1',
            prediction_id: 'pred-12345',
            fullName: 'John Doe',
            role: 'client',
            match_status: 'matched',
            timestamp: new Date().toISOString(),
            birthDetails: {
              dateOfBirth: '1990-01-01',
              timeOfBirth: '12:00',
              locationName: 'New York, NY',
              latitude: 40.7128,
              longitude: -74.0060
            },
            predictionData: {
              // Add prediction data structure here
            }
          },
          // Add more mock data as needed
        ];
        
        setHistory(mockData);
      } catch (error) {
        console.error('Failed to fetch prediction history:', error);
        toast.error('Failed to load prediction history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);

  // Filter predictions based on search query
  const filteredPredictions = useMemo(() => {
    if (!searchQuery.trim()) return history;
    
    const query = searchQuery.toLowerCase();
    return history.filter(prediction => 
      prediction.fullName?.toLowerCase().includes(query) ||
      prediction.prediction_id?.toLowerCase().includes(query) ||
      prediction.id?.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  const handleEditPrediction = (prediction: PredictionHistoryEntry) => {
    // Navigate to edit page with prediction ID
    navigate(`/edit-prediction/${prediction.id}`, { 
      state: { 
        predictionData: prediction.predictionData,
        birthDetails: prediction.birthDetails
      } 
    });
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      return;
    }

    try {
      setIsSearching(true);
      // In a real app, you would call your search API here
      // const response = await fetch(`/api/horoscopes/search?q=${encodeURIComponent(query)}`);
      // const results = await response.json();
      // setHistory(results);
      
      // For now, we'll just filter the existing data client-side
      setSearchQuery(query);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to perform search');
    } finally {
      setIsSearching(false);
    }
  };

  if (checking) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Astrologer Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage client predictions and view your horoscope readings
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/new-horoscope')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            + New Horoscope
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Prediction History</h3>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all your predictions
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No predictions match your search.' : 'No prediction history available.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <PredictionHistoryTable 
            data={filteredPredictions} 
            onEdit={handleEditPrediction} 
          />
        )}
      </div>
    </div>
  );
};

export default AstrologerDashboard;
