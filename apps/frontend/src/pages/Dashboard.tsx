import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ResearchStatCard from '../components/dashboard/ResearchStatCard';
import { Activity, Users, Clock, Calendar } from 'lucide-react';

const Dashboard = () => {
  // Mock data - replace with actual data from your API
  const stats = [
    {
      title: 'Total Predictions',
      value: '1,234',
      icon: <Activity className="w-6 h-6" />,
      color: 'border-purple-500',
      description: '+12% from last month',
    },
    {
      title: 'Active Users',
      value: '573',
      icon: <Users className="w-6 h-6" />,
      color: 'border-green-500',
      description: '+8% from last month',
    },
    {
      title: 'Avg. Response Time',
      value: '2.3h',
      icon: <Clock className="w-6 h-6" />,
      color: 'border-yellow-500',
      description: 'Faster than average',
    },
    {
      title: 'Upcoming Events',
      value: '12',
      icon: <Calendar className="w-6 h-6" />,
      color: 'border-blue-500',
      description: '3 happening today',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your predictions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <ResearchStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="bg-white shadow rounded p-6 col-span-4">
            <h3 className="text-lg font-semibold mb-4">Recent Predictions</h3>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Prediction chart will be displayed here
            </div>
          </div>
          <div className="bg-white shadow rounded p-6 col-span-3">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium">Generate New Prediction</h3>
                <p className="text-sm text-gray-500">Create a new horoscope prediction</p>
              </button>
              <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium">View History</h3>
                <p className="text-sm text-gray-500">Check your previous predictions</p>
              </button>
              <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium">Manage Profiles</h3>
                <p className="text-sm text-gray-500">Edit or add new profiles</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
