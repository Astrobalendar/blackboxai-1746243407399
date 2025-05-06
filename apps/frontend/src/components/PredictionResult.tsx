import React from "react";

interface Props {
  data: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    place?: string;
    sublord?: string;
    subSubLord?: string;
    rulingPlanets?: string[];
    nakshatra?: string;
    pada?: string;
    houseCusps?: Record<string, string>;
    planets?: Record<string, string>;
  };
  onBack: () => void;
}

const PredictionResult: React.FC<Props> = ({ data, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-xl text-gray-800 space-y-4">
      <h2 className="text-2xl font-bold text-center text-purple-800 mb-4">🌠 Your Horoscope Prediction</h2>

      {data?.name && (
        <div className="text-center text-lg font-semibold text-gray-600">🧑 {data.name}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div><strong>📅 DOB:</strong> {data.birthDate}</div>
        <div><strong>⏰ TOB:</strong> {data.birthTime}</div>
        <div><strong>📍 Place:</strong> {data.place}</div>
        <div><strong>🌟 Nakshatra:</strong> {data.nakshatra} - Pada {data.pada}</div>
        <div><strong>🔮 Sublord:</strong> {data.sublord}</div>
        <div><strong>🔮 Sub-Sub Lord:</strong> {data.subSubLord}</div>
      </div>

      {data.rulingPlanets && (
        <div>
          <h3 className="text-md font-semibold mt-4">🪐 Ruling Planets:</h3>
          <ul className="list-disc list-inside">
            {data.rulingPlanets.map((planet, i) => (
              <li key={i}>{planet}</li>
            ))}
          </ul>
        </div>
      )}

      {data.planets && (
        <div>
          <h3 className="text-md font-semibold mt-4">🌌 Planetary Positions:</h3>
          <ul className="list-disc list-inside">
            {Object.entries(data.planets).map(([planet, pos]) => (
              <li key={planet}>{planet}: {pos}</li>
            ))}
          </ul>
        </div>
      )}

      {data.houseCusps && (
        <div>
          <h3 className="text-md font-semibold mt-4">🏠 House Cusps:</h3>
          <ul className="list-disc list-inside">
            {Object.entries(data.houseCusps).map(([house, value]) => (
              <li key={house}>House {house}: {value}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded mt-6"
      >
        🔁 Get Another Prediction
      </button>
    </div>
  );
};

export default PredictionResult;