import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import ChartInsightPanel from '../research/ChartInsightPanel';
import { useAuth } from '../../context/AuthProvider';

// Utility: Generate mock chart and prediction data
function getMockChartData() {
  return {
    dob: '1992-07-15',
    tob: '10:45',
    pob: 'Chennai',
    lagna: 'Leo',
    kpDetails: { planets: ['Sun', 'Moon', 'Mars'], dasa: 'Venus', sublords: ['Mercury', 'Saturn'] },
  };
}
function getMockPredictions() {
  return [
    { topic: 'Career', notes: 'Strong period for growth.', confidence: 0.88 },
    { topic: 'Health', notes: 'Maintain regular exercise.', confidence: 0.72 },
    { topic: 'Finance', notes: 'Stable income, avoid risks.', confidence: 0.65 },
  ];
}


const STEPS = [
  { label: 'Chart', key: 'chart' },
  { label: 'Prediction', key: 'prediction' },
  { label: 'AI Insight', key: 'insight' },
  { label: 'Export', key: 'export' },
];

interface TestSessionViewProps {
  onComplete: () => void;
}

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addQrCodeToPdfFooter } from '../../modules/postlaunch/NextStepLaunchEnhancements';

const TestSessionView: React.FC<TestSessionViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<'astrologer' | 'client'>('astrologer');
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [shareWithClient, setShareWithClient] = useState(false);
  const { user } = useAuth();
  const [fullName, setFullName] = useState<string>('');

  // On mount: load or create session
  useEffect(() => {
    // Enable Firestore onSnapshot for live editing (astrologer role only)
    if (userRole === 'astrologer' && uid && sessionId) {
      const testDocRef = doc(db, 'users', uid, 'tests', sessionId);
      const unsub = onSnapshot(testDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setChartData(data.chartData || null);
          setPredictions(data.predictions || []);
          setInsights(data.insights || []);
        }
      });
      return () => unsub();
    }
  }, [userRole, uid, sessionId]);
    let mounted = true;
    setLoading(true);
    auth.onAuthStateChanged(async (user) => {
      if (!user) { setLoading(false); return; }
      const userId = user.uid;
      setUid(userId);
      // Try to find latest in-progress test
      const testsRef = collection(db, 'users', userId, 'tests');
      const testsSnap = await getDocs(testsRef);
      let foundId = null;
      testsSnap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.status === 'in_progress' && !foundId) foundId = docSnap.id;
      });
      let testId = foundId || `test_${Date.now()}`;
      setSessionId(testId);
      const testDocRef = doc(db, 'users', userId, 'tests', testId);
      const testDoc = await getDoc(testDocRef);
      if (testDoc.exists()) {
        const data = testDoc.data();
        setChartData(data.chartData || null);
        setPredictions(data.predictions || []);
        setInsights(data.insights || []);
        setShareWithClient(!!data.shareWithClient);
        setMockMode(false);
        // Try to get astrologer fullName from session doc first
        if (data.astrologerFullName) setFullName(data.astrologerFullName);
      } else {
        // Create new test with mock data
        const mockChart = getMockChartData();
        const mockPreds = getMockPredictions();
        // Also try to fetch astrologer fullName from Firestore user doc
        let astrologerName = '';
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const udata = userDoc.data();
            astrologerName = udata.fullName || '';
            setFullName(astrologerName);
          }
        } catch {}
        await setDoc(testDocRef, {
          testId,
          createdBy: userId,
          status: 'in_progress',
          createdAt: serverTimestamp(),
          chartData: mockChart,
          predictions: mockPreds,
          insights: [],
          astrologerFullName: astrologerName,
        });
        setChartData(mockChart);
        setPredictions(mockPreds);
        setInsights([]);
        setMockMode(true);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Save after each step
  useEffect(() => {
    if (!uid || !sessionId) return;
    if (loading) return;
    setSaving(true);
    const testDocRef = doc(db, 'users', uid, 'tests', sessionId);
    updateDoc(testDocRef, {
      chartData,
      predictions,
      insights,
      lastModified: serverTimestamp(),
    }).finally(() => setSaving(false));
  }, [step]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // PDF Export Handler
  const handleExportPDF = async () => {
    if (!uid || !sessionId) return;
    setExporting(true);
    setExportSuccess(false);
    try {
      const node = document.getElementById('pdf-export-content');
      if (!node) throw new Error('Export content not found');
      const canvas = await html2canvas(node, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      // Inject QR code in footer (session share URL)
      const sessionUrl = `${window.location.origin}/client/session/${sessionId}`;
      await addQrCodeToPdfFooter(pdf, sessionUrl, pageHeight - 30);
      const pdfBlob = pdf.output('blob');
      // Upload to Firestore Storage
      const storage = getStorage();
      const pdfRef = ref(storage, `users/${uid}/tests/${sessionId}/export.pdf`);
      await uploadBytes(pdfRef, pdfBlob, { contentType: 'application/pdf' });
      const url = await getDownloadURL(pdfRef);
      setPdfUrl(url);
      setExportSuccess(true);
      // Update test session metadata
      const testDocRef = doc(db, 'users', uid, 'tests', sessionId);
      await updateDoc(testDocRef, {
        status: 'completed',
        exportGeneratedAt: serverTimestamp(),
        pdfUrl: url,
        downloadCount: (testDocRef.downloadCount || 0) + 1,
        completedAt: serverTimestamp(),
      });
      // Confetti/toast
      if (window && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('confetti')); // Use a confetti library in real app
      }
    } catch (e) {
      alert('Export failed: ' + (e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  // Handlers for editing chart/prediction/insight (astrologer only)
  const handleChartChange = (field: string, value: any) => {
    if (userRole !== 'astrologer') return;
    setChartData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handlePredictionChange = (idx: number, field: string, value: any) => {
    if (userRole !== 'astrologer') return;
    setPredictions((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleInsightsChange = (ins: string[]) => {
    if (userRole !== 'astrologer') return;
    setInsights(ins);
  };

  if (loading) return <div className="text-center py-8">Loading test session...</div>;

  return (
    <div>
      <div className="bg-green-100 border-l-4 border-green-500 p-3 mb-4 rounded text-green-800 font-semibold text-center">
        ✅ Post-Launch Modules Active
      </div>
      {/* Progress Bar */}
      <div className="mb-6 flex items-center gap-4">
        {STEPS.map((s, idx) => (
          <div key={s.key} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx <= step ? 'bg-indigo-600' : 'bg-gray-300'}`}>{idx + 1}</div>
            <span className={`text-xs mt-1 ${idx === step ? 'font-semibold text-indigo-700' : 'text-gray-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>
      {/* Step Content */}
      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {step === 0 && <div>Chart step (mock or real chart here)</div>}
        {step === 1 && <div>Prediction step (prediction cards here)</div>}
        {step === 2 && <div>AI Insight step (ChartInsightPanel or summary)</div>}
        {step === 3 && (
          <div className="space-y-4">
            {/* Share with Client toggle (only for astrologer) */}
            {userRole === 'astrologer' && (
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="share-with-client"
                  className="mr-2 h-4 w-4 accent-indigo-600"
                  checked={!!shareWithClient}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setShareWithClient(checked);
                    if (uid && sessionId) {
                      const testDocRef = doc(db, 'users', uid, 'tests', sessionId);
                      await updateDoc(testDocRef, { shareWithClient: checked });
                    }
                  }}
                />
                <label htmlFor="share-with-client" className="text-sm font-medium text-indigo-700 select-none">
                  Share with Client
                </label>
                <span className="ml-2 text-xs text-gray-400">({shareWithClient ? 'Client can view & download' : 'Private to astrologer'})</span>
              </div>
            )}
            <div id="pdf-export-content" className="bg-white rounded-xl shadow p-6">
              <h2 className="font-bold text-xl mb-2">Horoscope Test Summary</h2>
              <div className="mb-2">
                <span className="font-semibold">Chart Overview:</span><br />
                DOB: {chartData?.dob} | TOB: {chartData?.tob} | POB: {chartData?.pob}<br />
                Lagna: {chartData?.lagna}<br />
                KP Planets: {chartData?.kpDetails?.planets?.join(', ')}<br />
                Dasa: {chartData?.kpDetails?.dasa} | Sublords: {chartData?.kpDetails?.sublords?.join(', ')}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Predictions:</span>
                <ul className="list-disc pl-6">
                  {predictions.map((p, i) => (
                    <li key={i}><b>{p.topic}:</b> {p.notes} <span className="text-xs text-gray-500">(Confidence: {Math.round(p.confidence*100)}%)</span></li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold">AI Insights:</span>
                <ul className="list-disc pl-6">
                  {insights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 border-t pt-2 text-xs text-gray-600">
                Prepared by: Astrologer {fullName || '[Name]'}<br/>
                Test ID: {sessionId}<br/>
                Timestamp: {new Date().toLocaleString()}<br/>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                disabled={saving || exporting}
                onClick={handleExportPDF}
              >{exporting ? 'Exporting...' : 'Export Summary as PDF'}</button>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`horoscope_test_${sessionId}.pdf`}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >Download PDF</a>
              )}
              {exportSuccess && <span className="text-green-600 font-semibold">Exported!</span>}
            </div>
          </div>
        )}
      </motion.div>
      {/* Controls */}
      <div className="flex mt-8 gap-4 justify-end">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={prev}
          disabled={step === 0}
        >Back</button>
        {step < STEPS.length - 1 ? (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={next}
          >Next</button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={onComplete}
          >Finish & Close</button>
        )}
      </div>
    </div>
  );
};

export default TestSessionView;
