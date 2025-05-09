import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import PredictionHistoryTable, { PredictionHistoryEntry } from '../../components/PredictionHistoryTable';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const res = await fetch(`/api/predictions/${user.uid}`);
      const data = await res.json();
      setHistory(data);
    };
    fetchHistory();
  }, [user]);
  return (
    <div>
      <h2>Client Dashboard</h2>
      <ul>
        <li>View up to 6 personal horoscopes</li>
        <li>Request Horoscope Update</li>
        <li>Share horoscope with astrologer</li>
      </ul>
      <h3 className="mt-8 mb-2 text-lg font-semibold">Prediction History</h3>
      <PredictionHistoryTable data={history} />
    </div>
  );
};

export default ClientDashboard;
