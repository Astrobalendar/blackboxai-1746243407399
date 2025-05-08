import React, { FunctionComponent } from "react";
import { PredictionResult as PredictionResultType } from '@shared/types/prediction';
import PredictionResult from "../components/PredictionResult";

interface PredictionPageProps {
  prediction: PredictionResultType | null;
}

const PredictionPage: FunctionComponent<PredictionPageProps> = ({ prediction }) => {
  const handleBack = () => {
    window.history.back();
  };

  const handleError = (error: string) => {
    console.error('Prediction error:', error);
  };

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
      <PredictionResult 
        prediction={prediction.data}
        showExport={true}
        onBack={handleBack}
        onError={handleError}
      />
    </div>
  );
};

export default PredictionPage;