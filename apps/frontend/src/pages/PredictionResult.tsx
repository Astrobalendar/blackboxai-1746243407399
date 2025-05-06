import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

*(Remove this line entirely.)*

interface PredictionResultProps {
  data: {
    ascendant: string;
    moon_sign: string;
    dasa: string;
    bhukti: string;
    antara: string;
    sub_lord: string;
    sub_sub_lord: string;
    ruling_planets: string[];
  };
  matchStatus: "match" | "no-match";
}

const PredictionResult: React.FC<PredictionResultProps> = ({ data, matchStatus }) => {
  const resultRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (resultRef.current) {
      html2pdf().from(resultRef.current).save(`${data.ascendant}_horoscope.pdf`);
    }
  };

  return (
    <div className="mt-6 space-y-4 bg-gray-100 p-6 rounded shadow" ref={resultRef}>
      <h3 className="text-xl font-bold">🧠 Prediction Summary</h3>
      <p><strong>Ascendant:</strong> {data.ascendant}</p>
      <p><strong>Moon Sign:</strong> {data.moon_sign}</p>
      <p><strong>Dasa / Bhukti / Antara:</strong> {data.dasa} / {data.bhukti} / {data.antara}</p>
      <p><strong>Sublord:</strong> {data.sub_lord}</p>
      <p><strong>Sub-sub Lord:</strong> {data.sub_sub_lord}</p>
      <p><strong>Ruling Planets:</strong> {data.ruling_planets.join(", ")}</p>
      <p className={matchStatus === "match" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
        Status: {matchStatus === "match" ? "✅ Sub-Sub Lord Matches" : "⚠️ Needs Correction"}
      </p>

      <button
        onClick={handleExport}
        className="mt-4 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
      >
        ⬇ Export as PDF
      </button>
    </div>
  );
};

export default PredictionResult;
