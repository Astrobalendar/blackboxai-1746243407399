import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const AdminPanel = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Admin Dashboard</h3>
          <p className="text-gray-600">
            Welcome to the admin panel. Use the navigation to manage the application.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
