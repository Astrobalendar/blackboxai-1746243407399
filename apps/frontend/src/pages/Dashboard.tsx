import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const Dashboard = () => (
  <DashboardLayout>
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      {/* Add widgets, stats, charts, etc. here */}
      <div className="mt-4">Welcome to your astrology dashboard!</div>
    </div>
  </DashboardLayout>
);

export default Dashboard;
