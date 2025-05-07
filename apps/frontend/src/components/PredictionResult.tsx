import React from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AstrologicalPrediction } from '../types/astrology';

interface PredictionResultProps {
  prediction: AstrologicalPrediction;
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
      
      // Add personal information
      doc.text(`Name: ${prediction.name}`, 10, y);
      y += 10;
      doc.text(`Date of Birth: ${prediction.dateOfBirth}`, 10, y);
      y += 10;
      doc.text(`Time of Birth: ${prediction.timeOfBirth}`, 10, y);
      y += 10;
      doc.text(`Place of Birth: ${prediction.placeOfBirth}`, 10, y);
      y += 10;
      doc.text(`Latitude: ${prediction.latitude}`, 10, y);
      y += 10;
      doc.text(`Longitude: ${prediction.longitude}`, 10, y);
      y += 10;
      doc.text(`Time Zone: ${prediction.timeZone}`, 10, y);
      y += 20;
      
      // Add houses information
      doc.text('Houses Analysis:', 10, y);
      y += 10;
      
      Object.entries(prediction.houses).forEach(([houseNumber, house]) => {
        y += 10;
        doc.text(`House ${houseNumber}:`, 10, y);
        y += 5;
        doc.text(`- Name: ${house.name}`, 15, y);
        y += 5;
        doc.text(`- Description: ${house.description}`, 15, y);
        y += 5;
        doc.text('- Influences:', 15, y);
        y += 5;
        house.influences.forEach((influence, index) => {
          doc.text(`  ${index + 1}. ${influence}`, 20, y + (index * 5));
        });
        y += 10;
      });

      doc.save(`${prediction.name}_astrological_prediction.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      onError('Failed to generate PDF');
    }
  };

  return (
    <div className="prediction-result">
      <h2>Your Astrological Prediction</h2>
      
      <div className="personal-info">
        <p><strong>Name:</strong> {prediction.name}</p>
        <p><strong>Date of Birth:</strong> {prediction.dateOfBirth}</p>
        <p><strong>Time of Birth:</strong> {prediction.timeOfBirth}</p>
        <p><strong>Place of Birth:</strong> {prediction.placeOfBirth}</p>
        <p><strong>Latitude:</strong> {prediction.latitude}</p>
        <p><strong>Longitude:</strong> {prediction.longitude}</p>
        <p><strong>Time Zone:</strong> {prediction.timeZone}</p>
      </div>

      <div className="houses-section">
        <h3>Houses Analysis</h3>
        {Object.entries(prediction.houses).map(([houseNumber, house]) => (
          <div key={houseNumber} className="house-info">
            <h4>House {houseNumber}</h4>
            <p><strong>Name:</strong> {house.name}</p>
            <p><strong>Description:</strong> {house.description}</p>
            <p><strong>Influences:</strong></p>
            <ul>
              {house.influences.map((influence, index) => (
                <li key={index}>{influence}</li>
              ))}
            </ul>
          </div>
        ))}
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