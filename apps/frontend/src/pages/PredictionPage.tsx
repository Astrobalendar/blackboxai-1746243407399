import React, { FunctionComponent, useState } from "react";
import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";

const PredictionPage: FunctionComponent = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = (data: any) => {
    setResult(data);
    setError(null);
  };

  const handleError = (err: any) => {
    setError("Something went wrong. Please try again.");
    console.error("Prediction error:", err);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-700 via-purple-500 to-blue-500 p-4">
      {result ? (
        <PredictionResult data={result} onBack={() => setResult(null)} />
      ) : (
        <PredictionForm onSuccess={handlePrediction} onError={handleError} />
      )}
      {error && (
        <div className="absolute bottom-4 text-red-200 text-sm">{error}</div>
      )}
    </div>
  );
};

export default PredictionPage;