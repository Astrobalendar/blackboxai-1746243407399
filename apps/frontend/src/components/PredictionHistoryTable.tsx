import React from 'react';

export interface PredictionHistoryEntry {
  prediction_id: string;
  display_name?: string;
  fullName?: string;
  displayName?: string;
  name?: string;
  role: string;
  match_status: string;
  timestamp: string;
}

interface PredictionHistoryTableProps {
  data: PredictionHistoryEntry[];
}

const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = ({ data }) => {
  if (!data.length) return <div className="text-gray-500">No predictions found.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border text-black text-sm rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Prediction ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.prediction_id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{entry.prediction_id}</td>
              <td className="py-2 px-4 border-b">{entry.fullName || entry.display_name || entry.displayName || entry.name || 'N/A'}</td>
              <td className="py-2 px-4 border-b">{entry.role}</td>
              <td className="py-2 px-4 border-b">{entry.match_status}</td>
              <td className="py-2 px-4 border-b">{new Date(entry.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionHistoryTable;
