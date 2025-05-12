import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import PredictionHistoryTable, { PredictionHistoryEntry } from '../../components/PredictionHistoryTable';

import { useRequireBirthData } from '../../components/useRequireBirthData';

const AstrologerDashboard: React.FC = () => {
  const { checking } = useRequireBirthData();
  const { user } = useAuth();
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
  if (checking) return null;
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
      <h2>Astrologer Dashboard</h2>
      <ul>
        <li>View assigned clients</li>
        <li>Generate Horoscope</li>
        <li>Send predictions to clients</li>
      </ul>
      <div className="my-6">
        <a href="/new-horoscope" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 text-lg font-semibold transition">+ New Horoscope</a>
      </div>
      <h3 className="mt-8 mb-2 text-lg font-semibold">Prediction History</h3>
      <PredictionHistoryTable data={history} />
    </div>
  );
};

export default AstrologerDashboard;
