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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">New Horoscope</h1>
      <BirthDataForm
        onSubmit={handleBirthDataSubmit}
        loading={loading}
        error={error}
      />
      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Prediction Result</h2>
          <pre className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap">
            {result}
          </pre>
          <button
            onClick={() => {
              const doc = new jsPDF();
              doc.text(result, 10, 10);
              doc.save('horoscope_prediction.pdf');
            }}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default NewHoroscope;
