import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ResearchStatCard from '../components/dashboard/ResearchStatCard';
import HoroscopeForm from '../components/HoroscopeForm';
import type { HoroscopeInput } from '@/shared/types/prediction';
import PredictionReport from './PredictionReport';
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

  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHoroscopeSubmit = async (data: HoroscopeInput) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/predict'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Prediction failed.');
      const result = await res.json();
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your predictions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-semibold mb-4">Enter Birth Details</h3>
            <HoroscopeForm onSubmit={handleHoroscopeSubmit} loading={loading} />
            {error && <div className="mt-4 text-red-600">{error}</div>}
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-semibold mb-4">Prediction Report</h3>
            {loading && <div>Loading prediction...</div>}
            {!loading && prediction && <PredictionReport prediction={prediction} />}
            {!loading && !prediction && <div className="text-gray-500">No prediction yet.</div>}
          </div>
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
