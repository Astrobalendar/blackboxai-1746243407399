import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useHoroscope } from '../../context/HoroscopeContext';
import { Search, Calendar, User, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Horoscope } from '../../services/horoscopeService';

// Extend the Horoscope type to include any additional fields we need
interface ExtendedHoroscope extends Omit<Horoscope, 'birthDate' | 'birthTime' | 'birthPlace'> {
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
  // Add any additional fields needed for display
  birthDetails?: {
    dateOfBirth?: string;
    timeOfBirth?: string;
    locationName?: string;
  };
}

const AstrologerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { horoscopes = [], loading, error } = useHoroscope();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHoroscopes, setFilteredHoroscopes] = useState<ExtendedHoroscope[]>([]);

  // Filter horoscopes based on search query
  useEffect(() => {
    try {
      const filtered = horoscopes
        .filter(horoscope => !!horoscope) // Filter out any undefined/null items
        .map(horoscope => ({
          ...horoscope,
          dateOfBirth: horoscope.birthDate,
          timeOfBirth: horoscope.birthTime,
          locationName: horoscope.birthPlace,
          birthDetails: {
            dateOfBirth: horoscope.birthDate,
            timeOfBirth: horoscope.birthTime,
            locationName: horoscope.birthPlace
          }
        }))
        .filter(horoscope => {
          if (!searchQuery.trim()) return true;
          
          const searchLower = searchQuery.toLowerCase();
          const locationName = horoscope.locationName || '';
          const dateOfBirth = horoscope.dateOfBirth || '';
          
          return (
            (horoscope.fullName?.toLowerCase() || '').includes(searchLower) ||
            locationName.toLowerCase().includes(searchLower) ||
            dateOfBirth.includes(searchQuery)
          );
        });
      
      setFilteredHoroscopes(filtered as ExtendedHoroscope[]);
    } catch (error) {
      console.error('Error filtering horoscopes:', error);
      setFilteredHoroscopes([]);
    }
  }, [searchQuery, horoscopes]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || 'N/A';
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.trim());
  };

  // Handle view details
  const handleViewDetails = (horoscope: ExtendedHoroscope) => {
    // Navigate to horoscope details page
    console.log('View details for:', horoscope.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Horoscopes</h2>
          <p className="text-gray-600 mb-4">{error.message || 'An unknown error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading horoscopes...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no horoscopes
  if (!filteredHoroscopes || filteredHoroscopes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
              <Search className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No horoscopes found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'Get started by creating a new horoscope'}
            </p>
            <Link
              to="/horoscope/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Create New Horoscope
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Horoscope Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all horoscopes
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/horoscope/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              New Horoscope
            </Link>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Search by name, location, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Horoscope list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredHoroscopes.map((horoscope) => (
              <li key={horoscope.id} className="hover:bg-gray-50 transition-colors duration-150">
                <Link to={`/horoscope/${horoscope.id}`} className="block">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {horoscope.fullName || 'Unnamed Horoscope'}
                          </p>
                          {horoscope.createdAt && (
                            <p className="text-sm text-gray-500">
                              Created: {formatDate(horoscope.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          View Details
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-x-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">{formatDate(horoscope.dateOfBirth)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">{formatTime(horoscope.timeOfBirth)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">{horoscope.locationName || 'Location not specified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AstrologerDashboard;
