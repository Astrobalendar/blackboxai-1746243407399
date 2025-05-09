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

import RasiChart from './charts/RasiChart';

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction, showExport, onBack, onError }) => {
  const [downloading, setDownloading] = React.useState(false);
  const [includeChart, setIncludeChart] = React.useState(true);
  const chartRef = React.useRef<HTMLDivElement>(null);

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
    toast.success('PDF generated and downloaded.');
  } catch (error) {
    // Fallback: client-side PDF generation
    try {
      const jsPDF = (await import('jspdf')).jsPDF;
      const html2canvas = (await import('html2canvas')).default;
      const doc = new jsPDF('p', 'mm', 'a4');
      // Add logo
      const logoImg = new Image();
      logoImg.src = '/astrobalendar-logo.png';
      // Wait for logo to load
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        doc.addImage(logoImg, 'PNG', 10, 10, 30, 30);
      }
      // Title and date
      doc.setFontSize(18);
      doc.text('AstroBalendar Prediction Report', 50, 20);
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 28);
      // Watermark
      doc.setTextColor(200);
      doc.setFontSize(40);
      doc.text('AstroBalendar', 50, 200, { angle: 45 });
      doc.setTextColor(0);
      doc.setFontSize(12);
      // Birth details
      let y = 50;
      doc.text('Birth Details:', 10, y);
      y += 7;
      const birthFields = ['name','dateOfBirth','timeOfBirth','state','district','city','locationName','latitude','longitude','timeZone'];
      birthFields.forEach((field) => {
        if (prediction[field]) {
          doc.text(`${field}: ${prediction[field]}`, 14, y);
          y += 6;
        }
      });
      // Prediction summary
      y += 2;
      doc.setFontSize(13);
      doc.text('Summary:', 10, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(doc.splitTextToSize(prediction.summary || '', 180), 14, y);
      y += 12;
      // D1 Chart
      if (includeChart && chartRef.current) {
        const chartNode = chartRef.current.querySelector('svg');
        if (chartNode) {
          const chartCanvas = await html2canvas(chartNode as HTMLElement, { backgroundColor: null });
          const imgData = chartCanvas.toDataURL('image/png');
          doc.setFontSize(13);
          doc.text('D1 (Rasi) Chart:', 10, y);
          y += 7;
          doc.addImage(imgData, 'PNG', 10, y, 80, 80);
          y += 85;
        }
      }
      // Prediction details
      doc.setFontSize(13);
      doc.text('Details:', 10, y);
      y += 7;
      doc.setFontSize(12);
      if (prediction.details && typeof prediction.details === 'object') {
        Object.entries(prediction.details).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 14, y);
          y += 6;
        });
      }
      // If too long, add new page
      if (y > 250) doc.addPage();
      // Save
      doc.save('astrobalendar_prediction.pdf');
      toast.success('PDF generated and downloaded.');
    } catch (err) {
      onError('PDF download failed');
      toast.error('Failed to generate PDF report. Try again.');
    }
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
      {/* D1 Chart Preview for PDF export */}
      <div style={{ display: includeChart ? 'block' : 'none' }} ref={chartRef} className="mb-3">
        <RasiChart data={prediction.rasiChartData || []} />
      </div>
      {showExport && (
        <div className="export-section">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="includeChart"
              checked={includeChart}
              onChange={e => setIncludeChart(e.target.checked)}
              disabled={downloading}
            />
            <label className="form-check-label" htmlFor="includeChart">
              Include D1 (Rasi) Chart in PDF
            </label>
          </div>
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