import React from 'react';
import { useAuth } from '../context/AuthProvider';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar would go here */}
      <aside className="w-64 bg-purple-900 text-white p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">KP Nuke Home</h2>
        <ul className="space-y-3">
          <li>Horoscope Entry</li>
          <li>Day Analysis</li>
          <li>Transit</li>
          <li>Dasa Bukthi</li>
          <li>Prasannam</li>
          {/* ...more */}
        </ul>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}</h1>
            <p className="text-gray-600">Today: {new Date().toLocaleString()}</p>
          </div>
          {/* Ruling planet widget, profile, etc. */}
        </header>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
