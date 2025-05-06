import React, { useState } from "react";
import PredictionResult from "./PredictionResult";
import PredictionTabs from "../components/PredictionTabs"; // Correct the import path
import BirthDataForm from "../components/BirthDataForm"; // Import BirthDataForm

type HoroscopeData = {
  name: string;
  date: string;
  time: string;
  location: string;
};

const NewHoroscope: React.FC = () => {
  const [formData, setFormData] = useState<HoroscopeData | null>(null); // Holds birth data
  const [result, setResult] = useState<any | null>(null); // Holds prediction result
  const [loading, setLoading] = useState(false);

  const handleBirthDataSubmit = async (data: HoroscopeData) => {
    setFormData(data);
    setLoading(true);
    try {
      const res = await fetch("https://astrobalendar-backend.onrender.com/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const prediction = await res.json();
      setResult(prediction);
    } catch {
      setResult({ error: "⚠️ Error fetching prediction." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-semibold mb-4">🧘‍♂️ New Horoscope Entry</h2>

      {!formData ? (
        <BirthDataForm onSubmit={handleBirthDataSubmit} />
      ) : (
        <>
          {loading ? (
            <div className="text-center text-purple-600">Loading...</div>
          ) : result ? (
            <>
              <pre className="mt-6 bg-gray-100 p-4 rounded text-sm overflow-x-auto text-black">
                {JSON.stringify(result, null, 2)}
              </pre>
              <PredictionTabs
                predictionData={{
                  ...formData,
                  ...result,
                }}
              />
            </>
          ) : (
            <div className="text-red-600 mt-4">⚠️ Error fetching prediction.</div>
          )}
        </>
      )}
    </div>
  );
};

export default NewHoroscope;
