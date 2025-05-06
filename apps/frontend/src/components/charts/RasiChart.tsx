// components/charts/RasiChart.tsx
import React, { useState } from "react";

interface RasiChartProps {
  data?: { name: string; house: number }[]; // Optional data for dynamic rendering
}

const RasiChart: React.FC<RasiChartProps> = ({ data = [] }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const houseLabels = [
    { x: 50, y: 20, label: "1" },
    { x: 150, y: 20, label: "2" },
    { x: 250, y: 20, label: "3" },
    { x: 250, y: 120, label: "4" },
    { x: 250, y: 220, label: "5" },
    { x: 150, y: 220, label: "6" },
    { x: 50, y: 220, label: "7" },
    { x: 50, y: 120, label: "8" },
    { x: 50, y: 70, label: "9" },
    { x: 150, y: 70, label: "10" },
    { x: 250, y: 70, label: "11" },
    { x: 150, y: 170, label: "12" },
  ];

  return (
    <div className="relative">
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className="border border-gray-300 bg-gray-50"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Outer square */}
        <rect x="0" y="0" width="300" height="300" fill="none" stroke="black" strokeWidth="2" />

        {/* Inner grid */}
        <line x1="0" y1="150" x2="300" y2="150" stroke="black" strokeWidth="1" />
        <line x1="150" y1="0" x2="150" y2="300" stroke="black" strokeWidth="1" />

        {/* Diagonal lines */}
        <line x1="0" y1="0" x2="300" y2="300" stroke="black" strokeWidth="1" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="black" strokeWidth="1" />

        {/* House labels */}
        {houseLabels.map((house, index) => (
          <text
            key={index}
            x={house.x}
            y={house.y}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="darkblue"
          >
            {house.label}
          </text>
        ))}

        {/* Dynamic data rendering */}
        {data.map((planet, index) => (
          <text
            key={index}
            x={houseLabels[planet.house - 1].x}
            y={houseLabels[planet.house - 1].y + 15}
            textAnchor="middle"
            fontSize="10"
            fill="blue"
            className="cursor-pointer hover:fill-red-500"
            onMouseEnter={(e) =>
              setTooltip({
                x: e.clientX,
                y: e.clientY,
                text: `${planet.name} in House ${planet.house}`,
              })
            }
          >
            {planet.name}
          </text>
        ))}
      </svg>
      {tooltip && (
        <div
          className="absolute bg-black text-white text-xs rounded px-2 py-1"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default RasiChart; // Ensure export is correct
