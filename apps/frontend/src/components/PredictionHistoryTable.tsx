import React, { useState } from 'react';
import { FiEdit2, FiSearch } from 'react-icons/fi';

export interface PredictionHistoryEntry {
  id: string;
  prediction_id: string;
  fullName?: string;
  role: string;
  match_status: string;
  timestamp: string;
  birthDetails?: {
    dateOfBirth: string;
    timeOfBirth: string;
    locationName: string;
    latitude: number;
    longitude: number;
  };
  predictionData?: any;
}

interface PredictionHistoryTableProps {
  data: PredictionHistoryEntry[];
  onEdit?: (prediction: PredictionHistoryEntry) => void;
}

const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = ({ data, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<PredictionHistoryEntry[]>(data);

  // Update filtered data when search term or data changes
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = data.filter(
        (item) =>
          (item.fullName?.toLowerCase().includes(searchLower) ||
          item.prediction_id.toLowerCase().includes(searchLower) ||
          item.role.toLowerCase().includes(searchLower) ||
          item.match_status.toLowerCase().includes(searchLower))
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  if (!data.length) return <div className="text-gray-500 p-4">No predictions found.</div>;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search predictions..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredData.length} of {data.length} predictions
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{entry.fullName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">ID: {entry.prediction_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {entry.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    entry.match_status === 'matched' 
                      ? 'bg-green-100 text-green-800' 
                      : entry.match_status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.match_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit && onEdit(entry)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Edit Prediction"
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No predictions match your search criteria.
        </div>
      )}
    </div>
  );
};

export default PredictionHistoryTable;
