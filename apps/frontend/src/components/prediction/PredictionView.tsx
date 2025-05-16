import React from 'react';
import PredictionCard from './PredictionCard';
import RadarChart from '../charts/RadarChart';
import StackedBarChart from '../charts/StackedBarChart';
import PieChart from '../charts/PieChart';
import LineChart from '../charts/LineChart';
import KPChartSVG from '../charts/KPChartSVG';
import PredictionTabBar from './PredictionTabBar';
import KPReportExport from './export/KPReportExport';
import AIChatAssistant from './AIChatAssistant';
import { useState } from 'react';

const PredictionView = ({ predictionData, chartsData, onEdit, user }: any) => {
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string|null>(null);

  const handleExportClick = () => {
    if (!predictionData) return;
    setShowExport(true);
  };

  const handleExportStart = () => setExporting(true);
  const handleExportEnd = () => {
    setExporting(false);
    setShowExport(false);
    setToast('PDF downloaded!');
    setTimeout(() => setToast(null), 2500);
  };
  const handleExportError = () => {
    setExporting(false);
    setToast('Failed to generate PDF');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="p-6 relative">
      <PredictionTabBar activeTab="Birth Data" />
      {/* AI Chat Assistant Widget */}
      <div className="mb-8 flex justify-end">
        <AIChatAssistant
          sessionId={`pred-${predictionData?.id || predictionData?.sessionId || 'unknown'}`}
          user={{ uid: user?.uid, role: user?.role, fullName: user?.fullName || user?.displayName }}
          chartContext={chartsData}
          dasaContext={chartsData?.dasaBhukti}
          predictionContext={predictionData}
        />
      </div>
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prediction for {predictionData?.fullName || predictionData?.name || 'Client'}</h2>
        <div>
          <button
            onClick={handleExportClick}
            className="btn btn-primary"
            disabled={!predictionData || exporting}
          >
            {exporting ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Generating PDF...</span>
            ) : (
              'Export Prediction PDF'
            )}
          </button>
        </div>
      </header>
      {showExport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-2 max-w-6xl w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold" onClick={() => setShowExport(false)}>&times;</button>
            <KPReportExport
              predictionData={predictionData}
              chartsData={chartsData}
              astrologerName={user?.fullName || user?.displayName || 'Astrologer'}
              onExported={handleExportEnd}
            />
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded shadow-lg z-50">{toast}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <PredictionCard title="General" content={predictionData?.general} editable onEdit={onEdit} />
        <PredictionCard title="Health" content={predictionData?.health} editable onEdit={onEdit} />
        <PredictionCard title="Education" content={predictionData?.education} editable onEdit={onEdit} />
        <PredictionCard title="Profession" content={predictionData?.profession} editable onEdit={onEdit} />
        <PredictionCard title="Marriage" content={predictionData?.marriage} editable onEdit={onEdit} />
        <PredictionCard title="Financial" content={predictionData?.financial} editable onEdit={onEdit} />
        <PredictionCard title="Travel" content={predictionData?.travel} editable onEdit={onEdit} />
        <PredictionCard title="Remedies" content={predictionData?.remedies} editable onEdit={onEdit} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RadarChart data={chartsData?.radar} />
        <StackedBarChart data={chartsData?.dasaBhukti} />
        <PieChart data={chartsData?.bhava} />
        <LineChart data={chartsData?.transit} />
        <KPChartSVG data={chartsData?.kp} />
      </div>
    </div>
  );
};

export default PredictionView;
