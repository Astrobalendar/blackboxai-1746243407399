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
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Astrological Prediction', 10, 10);
      doc.setFontSize(12);
      
      let y = 20;
      
      // Add prediction summary
      doc.text(`Summary: ${prediction.summary}`, 10, y);
      y += 20;
      
      // Add details
      doc.text('Details:', 10, y);
      y += 10;
      Object.entries(prediction.details).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, y);
        y += 10;
      });
      
      doc.save(`astrological_prediction.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      onError('Failed to generate PDF');
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
          <Button variant="primary" onClick={generatePDF}>
            Export as PDF
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