import React, { useState } from "react";
import type { EngineInput, EngineOutput } from "../ai/predict/engine";
import { runPrediction } from "../ai/predict/engine";

/**
 * PredictionPanel Component
 *
 * A UI panel for submitting horoscope data and displaying KP AI/ML predictions.
 * Accessible, responsive, and styled with Tailwind CSS.
 */
const defaultInput: EngineInput = {
  fullName: "",
  birthDate: "",
  birthTime: "",
  birthPlace: "",
};

export const PredictionPanel: React.FC = () => {
  const [input, setInput] = useState<EngineInput>(defaultInput);
  const [result, setResult] = useState<EngineOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const prediction = await runPrediction(input);
      setResult(prediction);
    } catch (err) {
      setError("Prediction failed. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Stellar Prediction Panel</h2>
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Horoscope Prediction Form">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</span>
          <input
            type="text"
            name="fullName"
            value={input.fullName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            aria-label="Full Name"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Birth Date</span>
          <input
            type="date"
            name="birthDate"
            value={input.birthDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            aria-label="Birth Date"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Birth Time</span>
          <input
            type="time"
            name="birthTime"
            value={input.birthTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            aria-label="Birth Time"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Birth Place</span>
          <input
            type="text"
            name="birthPlace"
            value={input.birthPlace}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            aria-label="Birth Place"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Get Prediction"}
        </button>
      </form>
      {error && <div className="mt-4 text-red-600 dark:text-red-400">{error}</div>}
      {result && (
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded">
          <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">Prediction Result</h3>
          <div className="text-gray-900 dark:text-white mb-1">{result.prediction}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Confidence: <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span></div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Model: {result.source}</div>
        </div>
      )}
    </section>
  );
};

export default PredictionPanel;
