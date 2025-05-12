import React from 'react';
import { PredictionResult as PredictionResultType } from '../../../../shared/types/prediction';
import RasiChart from './charts/RasiChart';

interface PredictionResultProps {
  prediction: PredictionResultType;
  showExport: boolean;
  onBack: () => void;
  onError: (error: string) => void;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction, showExport, onBack, onError }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pdf-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prediction),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'astrobalendar_prediction.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      onError('PDF download failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="prediction-result">
      <h2>Prediction Result</h2>
      <div className="mb-3">
        <strong>Summary:</strong>
        <div>{prediction.summary}</div>
      </div>
      <div className="mb-3">
        <strong>Details:</strong>
        <ul>
          {prediction.details && typeof prediction.details === 'object' && Object.entries(prediction.details).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {String(value)}</li>
          ))}
        </ul>
      </div>
      {/* Chart preview removed: PredictionResult type does not include chart data. If chart data is needed, extend the PredictionResult type and ensure it is passed as a prop. */}
      {showExport && (
        <div className="export-section">
          <button onClick={handleDownloadPDF} disabled={downloading} className="btn btn-primary">
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;