import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PredictionHistoryTable, { PredictionHistoryEntry } from '../components/PredictionHistoryTable';

const PredictionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual data from your API
  const mockData: PredictionHistoryEntry[] = [
    {
      id: '1',
      prediction_id: 'PRED-001',
      fullName: 'John Doe',
      role: 'User',
      match_status: 'Pending',
      timestamp: '2023-05-19T10:30:00Z',
      birthDetails: {
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        locationName: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    // Add more mock data as needed
  ];

  const handleEdit = (prediction: PredictionHistoryEntry) => {
    // Handle edit action
    console.log('Edit prediction:', prediction.id);
    // You can navigate to an edit page or show a modal here
  };

  const filteredData = mockData.filter(entry => 
    entry.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.prediction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Prediction History</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search predictions..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <PredictionHistoryTable 
            data={filteredData} 
            onEdit={handleEdit} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PredictionHistory;
