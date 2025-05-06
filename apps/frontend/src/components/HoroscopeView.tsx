import React from "react";
import jsPDF from "jspdf";

interface HoroscopeProps {
  data: {
    name: string;
    rulingPlanets: string[];
    sublords: string[];
    kpChart: string;
  };
}

const HoroscopeView: React.FC<HoroscopeProps> = ({ data }) => {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Your Horoscope", 10, 10);
    doc.text(`Name: ${data.name}`, 10, 20);
    doc.text("Ruling Planets:", 10, 30);
    data.rulingPlanets.forEach((planet, index) => {
      doc.text(`- ${planet}`, 10, 40 + index * 10);
    });
    doc.text("Sublords:", 10, 70);
    data.sublords.forEach((sublord, index) => {
      doc.text(`- ${sublord}`, 10, 80 + index * 10);
    });
    doc.text("KP Chart:", 10, 110);
    doc.text(data.kpChart, 10, 120);
    doc.save("horoscope.pdf");
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Horoscope Details</h2>
      <p><strong>Name:</strong> {data.name}</p>
      <h3 className="font-semibold mt-4">Ruling Planets</h3>
      <ul className="list-disc list-inside">
        {data.rulingPlanets.map((planet, index) => (
          <li key={index}>{planet}</li>
        ))}
      </ul>
      <h3 className="font-semibold mt-4">Sublords</h3>
      <ul className="list-disc list-inside">
        {data.sublords.map((sublord, index) => (
          <li key={index}>{sublord}</li>
        ))}
      </ul>
      <h3 className="font-semibold mt-4">KP Chart</h3>
      <p>{data.kpChart}</p>
      <button
        onClick={handleExport}
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
      >
        Export to PDF
      </button>
    </div>
  );
};

export default HoroscopeView;
