import React, { FunctionComponent } from "react";
import { PredictionResponse } from '../services/api';
import PredictionResult from "../components/PredictionResult";

interface PredictionPageProps {
  prediction: PredictionResponse | null;
}

const PredictionPage: FunctionComponent<PredictionPageProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-700 via-purple-500 to-blue-500 p-4">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (prediction.error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-700 via-purple-500 to-blue-500 p-4">
        <div className="text-center text-red-500">
          <h2 className="text-2xl mb-4">Error</h2>
          <p>{prediction.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-700 via-purple-500 to-blue-500 p-4">
      <PredictionResult data={prediction.data} onBack={() => window.history.back()} />
    </div>
  );
};

export default PredictionPage;