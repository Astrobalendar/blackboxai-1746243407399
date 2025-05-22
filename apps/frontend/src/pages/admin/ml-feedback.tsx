import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AiFeedbackSignal } from '../../modules/ml/feedbackSchema';
import { Sparkles, RefreshCw, Download } from 'lucide-react';

interface ModelCheckpoint {
  batchId: string;
  recordCount: number;
  createdAt: number;
  triggeredBy: string;
  datasetPathJsonl: string;
  datasetPathCsv: string;
  modelNotes?: string;
  versionId: string;
}

const MlFeedbackDashboard: React.FC = () => {
  const [feedback, setFeedback] = useState<AiFeedbackSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrainStatus, setRetrainStatus] = useState<string>('Idle');
  const [checkpoints, setCheckpoints] = useState<ModelCheckpoint[]>([]);
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      const q = query(collection(db, 'aiFeedbackSignals'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ recordId: doc.id, ...doc.data() })) as AiFeedbackSignal[];
      setFeedback(data);
      setLoading(false);
    };
    fetchFeedback();
  }, []);

  useEffect(() => {
    const fetchCheckpoints = async () => {
      setLoadingCheckpoints(true);
      const q = query(collection(db, 'aiModelCheckpoints'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ versionId: doc.id, ...doc.data() })) as ModelCheckpoint[];
      setCheckpoints(data);
      setLoadingCheckpoints(false);
    };
    fetchCheckpoints();
  }, [refresh]);

  const handleRetrain = async () => {
    setRetrainStatus('Triggering...');
    try {
      const res = await fetch('/api/aiTrainingBatches/retrain', { method: 'POST' });
      if (res.ok) {
        setRetrainStatus('Retrain triggered');
        setTimeout(() => setRefresh(r => r + 1), 2000); // Refresh checkpoints after retrain
      } else setRetrainStatus('Failed to trigger');
    } catch {
      setRetrainStatus('Failed to trigger');
    }
  };

  const topTopics = feedback.reduce((acc, f) => {
    const key = f.predictionRef.split('/').pop() || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- Last Retrain Summary ---
  const lastCheckpoint = checkpoints.length > 0 ? checkpoints[0] : null;
  const [autoRetrain, setAutoRetrain] = useState<boolean | null>(null);
  const [savingAuto, setSavingAuto] = useState(false);
  const [cronWarning, setCronWarning] = useState(false);

  // Fetch systemConfig/mlAutoRetrain
  useEffect(() => {
    const fetchAutoRetrain = async () => {
      const docSnap = await getDocs(query(collection(db, 'systemConfig')));
      const found = docSnap.docs.find(d => d.id === 'mlAutoRetrain');
      setAutoRetrain(found ? !!found.data().value : true);
    };
    fetchAutoRetrain();
  }, []);

  // Save toggle
  const handleToggleAutoRetrain = async () => {
    setSavingAuto(true);
    const val = !(autoRetrain ?? true);
    await db.collection('systemConfig').doc('mlAutoRetrain').set({ value: val });
    setAutoRetrain(val);
    setSavingAuto(false);
  };

  // Cron schedule badge logic
  let badgeColor = 'bg-blue-100 text-blue-800';
  let badgeText = '🕒 Next Scheduled Retrain: Sunday 03:00 UTC';
  let warn = false;
  if (lastCheckpoint && Date.now() - lastCheckpoint.createdAt > 8 * 24 * 60 * 60 * 1000) {
    badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-400';
    badgeText = '⚠️ Retrain overdue! Last run was over 8 days ago.';
    warn = true;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ML Feedback Dashboard</h1>
      <div className="flex gap-6 flex-wrap mb-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2" onClick={handleRetrain}>
          <RefreshCw className="w-4 h-4" /> Retrain Now
        </button>
        <span className="ml-2 text-sm text-gray-600">{retrainStatus}</span>
      </div>
      {/* Last Retrain Summary */}
      {lastCheckpoint && (
        <div className="bg-green-50 border-l-4 border-green-400 rounded p-4 mb-6 flex items-center gap-8 shadow">
          <Sparkles className="w-8 h-8 text-green-600" />
          <div>
            <div className="font-bold text-green-800 text-lg">Last Retrain Summary</div>
            <div className="text-sm text-gray-700">Model Version: <span className="font-mono">{lastCheckpoint.versionId}</span></div>
            <div className="text-sm">Retrain Date: <span className="font-mono">{new Date(lastCheckpoint.createdAt).toLocaleString()}</span></div>
            <div className="text-sm">Feedback Used: <span className="font-mono">{lastCheckpoint.recordCount}</span></div>
            <div className="text-sm">Triggered By: <span className="font-mono">{lastCheckpoint.triggeredBy}</span></div>
            <div className="flex gap-3 mt-2">
              <a href={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_BUCKET || 'YOUR_BUCKET'}/${lastCheckpoint.datasetPathCsv}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline flex items-center gap-1"><Download className="w-4 h-4"/>CSV</a>
              <a href={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_BUCKET || 'YOUR_BUCKET'}/${lastCheckpoint.datasetPathJsonl}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline flex items-center gap-1"><Download className="w-4 h-4"/>JSONL</a>
            </div>
          </div>
        </div>
      )}
      {/* Retrain History Table */}
      <div className="mb-10">
        <h2 className="font-semibold mb-2">Retrain History</h2>
        {loadingCheckpoints ? <div>Loading...</div> : (
          <table className="w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Version</th>
                <th className="p-2">Date</th>
                <th className="p-2">Feedbacks</th>
                <th className="p-2">Triggered By</th>
                <th className="p-2">CSV</th>
                <th className="p-2">JSONL</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map(cp => (
                <tr key={cp.versionId} className="border-b">
                  <td className="font-mono p-2">{cp.versionId}</td>
                  <td className="p-2">{new Date(cp.createdAt).toLocaleString()}</td>
                  <td className="p-2">{cp.recordCount}</td>
                  <td className="p-2">{cp.triggeredBy}</td>
                  <td className="p-2">
                    <a href={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_BUCKET || 'YOUR_BUCKET'}/${cp.datasetPathCsv}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline flex items-center gap-1"><Download className="w-4 h-4"/>CSV</a>
                  </td>
                  <td className="p-2">
                    <a href={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_BUCKET || 'YOUR_BUCKET'}/${cp.datasetPathJsonl}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline flex items-center gap-1"><Download className="w-4 h-4"/>JSONL</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Feedback Stats */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Feedback Volume: {feedback.length}</h2>
        <h3 className="font-semibold mb-2">Top Corrected Topics</h3>
        <ul className="mb-4">
          {Object.entries(topTopics).map(([topic, count]) => (
            <li key={topic}>{topic}: {count}</li>
          ))}
        </ul>
        <h3 className="font-semibold mb-2">Recent Feedback</h3>
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Thumbs</th>
                <th>Correction</th>
                <th>Confidence</th>
                <th>Gold</th>
                <th>By</th>
                <th>Session</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map(f => (
                <tr key={f.recordId}>
                  <td>{f.thumbs === 'up' ? '👍' : '👎'}</td>
                  <td>{f.correction}</td>
                  <td>{f.confidence}</td>
                  <td>{f.markAsGold ? '⭐' : ''}</td>
                  <td>{f.annotatedBy}</td>
                  <td>{f.sourceSessionId}</td>
                  <td>{new Date(f.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MlFeedbackDashboard;
