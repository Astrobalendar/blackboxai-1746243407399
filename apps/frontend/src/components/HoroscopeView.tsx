import React from "react";
import jsPDF from "jspdf";

interface HoroscopeProps {
  data: Record<string, any>;
}

const HoroscopeView: React.FC<HoroscopeProps> = ({ data }) => {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Your Horoscope", 10, 10);
    
    // Add all available data fields
    Object.entries(data).forEach(([key, value], index) => {
      if (Array.isArray(value)) {
        doc.text(`${key}:`, 10, 20 + index * 20);
        value.forEach((item, i) => {
          doc.text(`- ${item}`, 10, 30 + (index * 20) + (i * 10));
        });
      } else {
        doc.text(`${key}: ${value}`, 10, 20 + index * 20);
      }
    });
    
    doc.save("horoscope.pdf");
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="space-y-6">
        {data && Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">{key}</h3>
            {Array.isArray(value) ? (
              <ul className="list-disc list-inside space-y-1">
                {value.map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            ) : typeof value === 'object' && value !== null ? (
              <div className="space-y-2">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="flex items-center">
                    <span className="font-medium w-24">{subKey}:</span>
                    <span className="text-gray-700">{subValue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">{value}</p>
            )}
          </div>
        ))}
      </div>
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
