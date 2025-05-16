import React from 'react';

interface ResearchStatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

const ResearchStatCard: React.FC<ResearchStatCardProps> = ({ title, value, icon, color }) => (
  <div className={`bg-white shadow rounded p-4 flex items-center space-x-4 border-l-4 ${color || 'border-blue-400'}`}>
    <div className="text-3xl">
      {icon}
    </div>
    <div>
      <p className="text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

export default ResearchStatCard;
