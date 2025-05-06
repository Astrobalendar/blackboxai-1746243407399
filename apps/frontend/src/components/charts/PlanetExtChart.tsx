import React from "react";

interface PlanetExtChartProps {
  data?: { name: string; degree: string; house: number }[]; // Optional data for dynamic rendering
}

const PlanetExtChart: React.FC<PlanetExtChartProps> = ({ data = [] }) => {
  return (
    <div className="border border-gray-300 p-4">
      <h3 className="text-lg font-bold mb-2">Planetary Positions</h3>
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr>
            <th className="border border-gray-400 px-2 py-1">Planet</th>
            <th className="border border-gray-400 px-2 py-1">Degree</th>
            <th className="border border-gray-400 px-2 py-1">House</th>
          </tr>
        </thead>
        <tbody>
          {data.map((planet, index) => (
            <tr key={index}>
              <td className="border border-gray-400 px-2 py-1">{planet.name}</td>
              <td className="border border-gray-400 px-2 py-1">{planet.degree}</td>
              <td className="border border-gray-400 px-2 py-1">{planet.house}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetExtChart;
