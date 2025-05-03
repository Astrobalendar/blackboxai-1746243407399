import React from 'react';

interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon: string; // Placeholder for icon name
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white shadow rounded p-4 flex items-center space-x-4">
      <div className="text-3xl text-blue-500">
        {/* TODO: Replace with actual icon component */}
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div>
        <p className="text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default AdminStatCard;
