import React, { useState } from "react";
import jsPDF from "jspdf";
import { fetchPrediction } from "../services/api";
import BirthDataForm from './BirthDataForm';

type HoroscopeData = {
  name: string;
  date: string;
  time: string;
  location: string;
};

interface NewHoroscopeProps {
  onPrediction?: (data: any) => void;
}

const NewHoroscope: React.FC<NewHoroscopeProps> = ({ onPrediction }) => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HoroscopeData>({ name: '', date: '', time: '', location: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBirthDataSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPrediction({
        birthData: {
          date: formData.dateOfBirth,
          time: formData.timeOfBirth,
          location: formData.placeOfBirth
        },
        name: formData.name
      });

      if (response.success) {
        setResult(JSON.stringify(response.data, null, 2));
        if (onPrediction) {
          onPrediction(response.data);
        }
      } else {
        throw new Error(response.error || "Prediction failed");
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Horoscope Report", 10, 10);
    doc.text(`Name: ${formData.name}`, 10, 20);
    doc.text(`Date: ${formData.date}`, 10, 30);
    doc.text(`Time: ${formData.time}`, 10, 40);
    doc.text(`Location: ${formData.location}`, 10, 50);
    doc.text("Prediction Result:", 10, 60);
    doc.text(result || "No result", 10, 70);
    doc.save("horoscope.pdf");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-purple-900 to-black rounded-lg shadow-2xl">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">New Horoscope</h1>
        <div className="bg-purple-800 rounded-lg p-6">
          <BirthDataForm
            onSubmit={handleBirthDataSubmit}
            loading={loading}
            error={error}
          />
        </div>
        {result && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">Prediction Result</h2>
            <div className="bg-purple-800 rounded-lg p-6">
              <pre className="text-white bg-purple-900/50 p-4 rounded-md whitespace-pre-wrap overflow-auto max-h-[400px]">
                {result}
              </pre>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleExport}
                  className="bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewHoroscope;
