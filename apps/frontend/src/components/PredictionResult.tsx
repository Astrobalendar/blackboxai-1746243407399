import React from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PredictionResult as PredictionResultType } from '@shared/types/prediction';
import { formatPredictionSummary } from '@shared/utils/format';

interface PredictionResultProps {
  prediction: PredictionResultType;
  showExport: boolean;
  onBack: () => void;
  onError: (error: string) => void;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction, showExport, onBack, onError }) => {
  const [downloading, setDownloading] = React.useState(false);

  declare global {
  interface Window {
    posthog?: typeof import('posthog-js');
  }
}

const handleDownloadPDF = async () => {
  // PostHog PDF download event
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('pdf_downloaded', {
      source: 'prediction_result',
      timestamp: new Date().toISOString()
    });
  }

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
      onError('PDF download failed');
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
          {Object.entries(prediction.details).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </ul>
      </div>

      {showExport && (
        <div className="export-section">
          <Button variant="primary" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;