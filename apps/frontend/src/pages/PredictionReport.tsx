import React from 'react';
import ExportPanel from '../components/ExportPanel';

const tabs = [
  { label: 'Ruling Planets', id: 'ruling' },
  { label: 'Dasa Bhukti', id: 'dasa' },
  { label: 'Sublord Table', id: 'sublord' },
];

import type { PredictionData } from '@/shared/types/prediction';


interface PredictionReportProps {
  prediction?: PredictionData;
}

const PredictionReport: React.FC<PredictionReportProps> = ({ prediction }) => {
  const [activeTab, setActiveTab] = React.useState('ruling');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Prediction Report</h2>
      <div className="flex space-x-4 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} font-semibold`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-4 rounded shadow">
        {activeTab === 'ruling' && (
          <div>
            <h3 className="font-semibold mb-2">Ruling Planets</h3>
            {prediction?.rulingPlanets && prediction.rulingPlanets.length > 0 ? (
              <ul className="list-disc ml-6 text-gray-700">
                {prediction.rulingPlanets.map((planet: string, idx: number) => (
                  <li key={idx}>{planet}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No ruling planets data.</div>
            )}
          </div>
        )}
        {activeTab === 'dasa' && (
          <div>
            <h3 className="font-semibold mb-2">Dasa Bhukti Table</h3>
            {prediction?.dasaBhukti && prediction.dasaBhukti.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Period</th>
                    <th className="px-2 py-1">Lord</th>
                    <th className="px-2 py-1">Start</th>
                    <th className="px-2 py-1">End</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.dasaBhukti.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1">{row.period}</td>
                      <td className="px-2 py-1">{row.lord}</td>
                      <td className="px-2 py-1">{row.start}</td>
                      <td className="px-2 py-1">{row.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500">No dasa bhukti data.</div>
            )}
          </div>
        )}
        {activeTab === 'sublord' && (
          <div>
            <h3 className="font-semibold mb-2">Sublord Table</h3>
            {prediction?.sublordTable && prediction.sublordTable.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1">House</th>
                    <th className="px-2 py-1">Sublord</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.sublordTable.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1">{row.house}</td>
                      <td className="px-2 py-1">{row.sublord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500">No sublord data.</div>
            )}
          </div>
        )}
        {!prediction && <div className="text-gray-400">No prediction data available.</div>}
      </div>
      <ExportPanel />
    </div>
  );
};

export default PredictionReport;
