import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHoroscope } from '../../context/HoroscopeContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface Horoscope {
  id: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  createdAt: { toDate: () => Date };
  [key: string]: any;
}

const MyHoroscopes: React.FC = () => {
  const { horoscopes, loading, error, loadHoroscopes } = useHoroscope();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load horoscopes on initial render
  const fetchHoroscopes = useCallback(async () => {
    try {
      await loadHoroscopes();
    } catch (err) {
      console.error('Failed to load horoscopes:', err);
      toast.error('Failed to load horoscopes. Please try again.');
    } finally {
      setIsInitialLoad(false);
    }
  }, [loadHoroscopes]);

  useEffect(() => {
    fetchHoroscopes();
  }, [fetchHoroscopes]);

  const filteredHoroscopes = React.useMemo(() => {
    if (!searchTerm.trim()) return horoscopes;
    
    const searchLower = searchTerm.toLowerCase();
    return horoscopes.filter(horoscope => 
      (horoscope.fullName?.toLowerCase().includes(searchLower) ||
      horoscope.birthPlace?.toLowerCase().includes(searchLower))
    );
  }, [horoscopes, searchTerm]);

  const noResults = !loading && filteredHoroscopes.length === 0;
  
  // Calculate initials for avatar
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleViewHoroscope = (id: string) => {
    navigate(`/horoscope/${id}`);
  };

  const handleEditHoroscope = (id: string) => {
    navigate(`/horoscope/${id}/edit`);
  };

  if (loading && isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error && !isInitialLoad) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-800 mb-2">My Horoscopes</h1>
        <p className="text-yellow-700">View and manage your saved horoscopes</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => navigate('/horoscope/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Horoscope
          </button>
        </div>

        {noResults ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No horoscopes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new horoscope.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/horoscope/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Horoscope
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Birth Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHoroscopes.map((horoscope) => (
                  <tr key={horoscope.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-800 font-medium">
                            {getInitials(horoscope.fullName)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{horoscope.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {horoscope.birthDate && new Date(horoscope.birthDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {horoscope.birthTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{horoscope.birthPlace}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {horoscope.createdAt ? format(horoscope.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewHoroscope(horoscope.id)}
                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditHoroscope(horoscope.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHoroscopes;
