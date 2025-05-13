import React, { useState } from 'react';
import PredictionView from '../components/prediction/PredictionView';
import axios from 'axios';

const Prediction = () => {
  const [predictionData, setPredictionData] = useState<any>({});
  const [chartsData, setChartsData] = useState<any>({});

  const handleEdit = (title: string, value: string) => {
    setPredictionData((prev: any) => ({ ...prev, [title.toLowerCase()]: value }));
  };

  const handleExportPDF = () => {
    // PDF export handled in PredictionView
  };

  const handlePredict = async (birthData: any, question: string) => {
    const res = await axios.post('/api/predict', { birthData, question });
    setPredictionData((prev: any) => ({ ...prev, general: res.data.prediction }));
  };

  return (
    <div>
      <button onClick={() => handlePredict({ name: 'Test User' }, 'What is my future?')} className="btn btn-accent mb-4">Get AI Prediction</button>
      <PredictionView
        predictionData={predictionData}
        chartsData={chartsData}
        onEdit={handleEdit}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
};

export default Prediction;
