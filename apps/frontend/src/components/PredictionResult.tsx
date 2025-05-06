import React from "react";

interface Props {
  data: any;
  onBack: () => void;
}

const PredictionResult: React.FC<Props> = ({ data, onBack }) => {
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">🌠 Your Prediction</h2>

      {data && typeof data === "object" ? (
        <div className="text-left text-gray-700 space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <strong className="capitalize">{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Prediction received.</p>
      )}

      <button
        onClick={onBack}
        className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition duration-300"
      >
        🔁 Get Another Prediction
      </button>
    </div>
  );
};

export default PredictionResult;