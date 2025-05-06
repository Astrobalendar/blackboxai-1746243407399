// components/charts/NavamsaChart.tsx
import React from "react";

interface NavamsaChartProps {
  data?: { name: string; house: number }[]; // Optional data for dynamic rendering
}

const NavamsaChart: React.FC<NavamsaChartProps> = ({ data = [] }) => {
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
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className="border border-gray-300"
    >
      {/* Outer square */}
      <rect x="0" y="0" width="300" height="300" fill="none" stroke="black" />

      {/* Inner grid */}
      <line x1="0" y1="150" x2="300" y2="150" stroke="black" />
      <line x1="150" y1="0" x2="150" y2="300" stroke="black" />

      {/* Diagonal lines */}
      <line x1="0" y1="0" x2="300" y2="300" stroke="black" />
      <line x1="300" y1="0" x2="0" y2="300" stroke="black" />

      {/* House labels */}
      {houseLabels.map((house, index) => (
        <text
          key={index}
          x={house.x}
          y={house.y}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
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
        >
          {planet.name}
        </text>
      ))}
    </svg>
  );
};

export default NavamsaChart;
