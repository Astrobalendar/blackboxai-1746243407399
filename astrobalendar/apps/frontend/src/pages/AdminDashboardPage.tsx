import React, { useEffect, useState } from 'react';
import AdminStatCard from '../components/AdminStatCard';
import RevenueChart from '../components/RevenueChart';
import PredictionTable from '../components/PredictionTable';
import PaymentTable from '../components/PaymentTable';
import { getAdminStats, getAdminPredictions, getAdminPayments } from '../services/adminService';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const statsData = await getAdminStats();
      setStats(statsData);

      const predictionsData = await getAdminPredictions();
      setPredictions(predictionsData);

      const paymentsData = await getAdminPayments();
      setPayments(paymentsData);
    }
    fetchData();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <AdminStatCard title="Users" value={stats.total_users} icon="users" />
        <AdminStatCard title="Clients" value={stats.total_clients} icon="user-friends" />
        <AdminStatCard title="Predictions" value={stats.total_predictions} icon="chart-line" />
        <AdminStatCard title="Revenue" value={`$${stats.total_revenue.toFixed(2)}`} icon="dollar-sign" />
      </div>
      <div className="mb-6">
        <RevenueChart />
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Predictions</h2>
        <PredictionTable data={predictions} />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Payments</h2>
        <PaymentTable data={payments} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
