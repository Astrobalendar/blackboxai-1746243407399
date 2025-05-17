import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';
import BirthDataForm from '../components/BirthDataForm';
import RasiChart from '../components/charts/RasiChart';
import NavamsaChart from '../components/charts/NavamsaChart';
import { getChartData, PlanetPlacement } from '../services/astrology';

// i18n imports
import { useTranslation } from 'react-i18next';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const TAB_LIST = [
  'Birth Data',
  'Rasi/Navam',
  'KP Horoscope',
  'Career',
  'Health',
  'Finance',
  'Relationships',
  'Sublord Chains',
  'Dasa Periods',
  'Planet Ext',
  'Cuspal Ext-1',
  'Cuspal Ext-2',
  'Feedback Summary',
  'PDF Export',
  'Client Feedback',
  'Notes',
  'Chart Snapshot',
  'AI Insights',
];

const PredictionView: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { docId } = useParams<{ docId: string }>();
  const { user, userRole, loading: authLoading } = useAuth();
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState<any>({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock data injection
  useEffect(() => {
    if (window.location.search.includes('mock=true')) {
      setHoroscope({
        fullName: 'Yeshwanth Krishna KS',
        gender: 'Male',
        fatherName: 'Krishna KS',
        familyName: 'Krishna',
        gothram: 'Bharadwaj',
        referenceId: 'YE4721',
        dateOfBirth: '2005-03-04',
        timeOfBirth: '00:12',
        placeOfBirth: 'Nungambakkam, Chennai',
        createdAt: { seconds: Date.now() / 1000 },
        shareWithClient: true,
        createdBy: { uid: 'mock-uid', fullName: 'Astrologer Name' },
        predictions: Object.fromEntries(TAB_LIST.map(tab => [tab, `Mock prediction for ${tab}`])),
        chartData: Object.fromEntries(TAB_LIST.map(tab => [tab, `Mock chart for ${tab}`])),
        aiInsights: Object.fromEntries(TAB_LIST.map(tab => [tab, `Mock AI insight for ${tab}`])),
      });
      setLoading(false);
      return;
    }
    // Fetch horoscope data
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'horoscopes', docId!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHoroscope({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Prediction not found.');
        }
      } catch (e) {
        setError('Error loading prediction.');
      } finally {
        setLoading(false);
      }
    };
    if (docId) fetchData();
  }, [docId]);

  // Feedback handler
  const handleFeedbackChange = (topic: string, type: string, value: any) => {
    setFeedback((prev: any) => ({
      ...prev,
      [topic]: { ...prev[topic], [type]: value }
    }));
  }

  // Feedback submit
  const submitFeedback = async (topic: string) => {
    const data = feedback[topic];
    if (!data) return;
    await setDoc(doc(db, 'aiFeedbackSignals', `${docId}_${topic}_${user?.uid}`), {
      docId,
      topic,
      ...data,
      timestamp: new Date().toISOString(),
      annotatedBy: user?.uid,
      sessionId: `${docId}_${user?.uid}`
    });
  };

  // PDF Export
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      // Build PDF with all tab data
      const pdf = new jsPDF('p', 'mm', 'a4');
      let y = 10;
      pdf.setFontSize(18);
      pdf.text(t('Horoscope Prediction'), 10, y);
      y += 10;
      pdf.setFontSize(12);
      pdf.text(`${t('Name')}: ${horoscope.fullName}`, 10, y);
      y += 8;
      pdf.text(`${t('DOB')}: ${horoscope.dateOfBirth}`, 10, y);
      y += 8;
      pdf.text(`${t('TOB')}: ${horoscope.timeOfBirth}`, 10, y);
      y += 8;
      pdf.text(`${t('Gender')}: ${horoscope.gender}`, 10, y);
      y += 8;
      pdf.text(`${t('Reference ID')}: ${horoscope.referenceId || horoscope.id}`, 10, y);
      y += 8;
      pdf.text(`${t('Place of Birth')}: ${horoscope.placeOfBirth || horoscope.locationName}`, 10, y);
      y += 8;
      // QR code
      const qrCanvas = document.createElement('canvas');
      // @ts-ignore
      QRCodeCanvas({ value: window.location.href, size: 64, includeMargin: true, renderAs: 'canvas', canvas: qrCanvas });
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      pdf.addImage(qrDataUrl, 'PNG', 160, 10, 30, 30);
      y += 20;
      pdf.setLineWidth(0.5);
      pdf.line(10, y, 200, y);
      y += 5;
      // Add each tab section
      TAB_LIST.forEach(tab => {
        if (tab === 'PDF Export') return;
        pdf.setFontSize(14);
        pdf.text(t(tab), 10, y);
        y += 7;
        pdf.setFontSize(11);
        const content = horoscope?.predictions?.[tab] || horoscope?.chartData?.[tab] || horoscope?.aiInsights?.[tab] || t('No data available for', { tab });
        const splitContent = pdf.splitTextToSize(content, 180);
        pdf.text(splitContent, 10, y);
        y += splitContent.length * 6 + 5;
        if (y > 270) { pdf.addPage(); y = 10; }
      });
      const refId = horoscope.referenceId || horoscope.id;
      const fileName = `prediction_${refId}.pdf`;
      pdf.save(fileName);

      // Upload to Firestore Storage
      const pdfBlob = pdf.output('blob');
      const storage = getStorage();
      const fileRef = storageRef(storage, `/users/${horoscope.createdBy?.uid || 'unknown'}/predictions/${docId}/export.pdf`);
      await uploadBytes(fileRef, pdfBlob);
      const downloadURL = await getDownloadURL(fileRef);
      // Store metadata in Firestore
      await setDoc(doc(db, 'horoscopes', docId!), {
        pdfExportedAt: new Date().toISOString(),
        pdfExportedBy: user?.uid,
        pdfExportedName: user?.displayName || 'Unknown User',
        pdfDownloadURL: downloadURL
      }, { merge: true });
    } catch (e) {
      setError('Failed to export PDF');
    } finally {
      setPdfLoading(false);
    }
  };


  // Fetch horoscope data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'horoscopes', docId!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHoroscope({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Prediction not found.');
        }
      } catch (e) {
        setError('Error loading prediction.');
      } finally {
        setLoading(false);
      }
    };
    if (docId) fetchData();
  }, [docId]);

  if (loading || authLoading) return <div className="p-8 text-center text-lg">Loading...</div>;
  if (error) {
    if (error === 'Prediction not found.' || error === 'Error loading prediction.') {
      return <div className="p-8 text-center text-red-500">Prediction not found or has been deleted.</div>;
    }
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!horoscope) return null;

  // Public/shared access logic
  const isShared = horoscope.shareWithClient === true;
  const isLoggedIn = !!user;
  const isReadOnly = !isLoggedIn && isShared;
  if (!isLoggedIn && !isShared) {
    return <div className="p-8 text-center text-red-500">You are not authorized to view this prediction.</div>;
  }

  const canEdit = userRole === 'admin' || (userRole === 'astrologer' && horoscope?.createdBy?.uid === user?.uid);
  const canExport = canEdit;
  const shareWithClient = !!horoscope?.shareWithClient;

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="sticky top-0 z-20 w-full bg-white shadow py-3 border-b">
        <div className="container mx-auto text-center flex flex-col items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-yellow-900 flex flex-col md:flex-row items-center justify-center gap-2 text-center">
            Prediction for {horoscope.fullName} by {horoscope.astrologerFullName || horoscope.createdBy?.fullName || 'Astrologer'}
            {isShared ? (
              <span className="ml-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700" title="Publicly Viewable" aria-label="Publicly Viewable">🔓 Publicly Viewable</span>
            ) : (
              <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-200 text-gray-600" title="Private" aria-label="Private">🔒 Private</span>
            )}
          </h1>
          <div className="text-gray-700 text-sm mt-1 flex flex-wrap gap-3 justify-center">
            <span>DOB: {horoscope.dateOfBirth}</span>
            <span>TOB: {horoscope.timeOfBirth}</span>
            <span>POB: {horoscope.placeOfBirth || horoscope.locationName}</span>
            <span>Gender: {horoscope.gender || '-'}</span>
            <span>Ref: {horoscope.referenceId || horoscope.id}</span>
            <span>Created: {horoscope.createdAt?.seconds ? new Date(horoscope.createdAt.seconds * 1000).toLocaleDateString() : '-'}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0 justify-center w-full">
          <button className="px-3 py-2 bg-yellow-200 rounded font-semibold hover:bg-yellow-300" onClick={() => navigate('/horoscope/list')} aria-label="Back to Horoscope List" title="Back to Horoscope List">Back to Horoscope List</button>
          <button className="px-3 py-2 bg-yellow-100 rounded font-semibold hover:bg-yellow-200" onClick={() => navigate('/horoscope/search')} aria-label="Search Horoscope" title="Search Horoscope">Search Horoscope</button>
        </div>
      </div>
      {/* Tab Bar */}
      <nav className="sticky top-[64px] z-10 bg-white border-b w-full overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-200" aria-label="Prediction Sections">
        <ul className="flex whitespace-nowrap w-full overflow-x-auto border-b" role="tablist">
          {TAB_LIST.map((tab, idx) => (
            <li key={tab} className="relative" role="presentation">
              <motion.button
                role="tab"
                aria-selected={activeTab === idx}
                aria-controls={`tabpanel-${idx}`}
                id={`tab-${idx}`}
                tabIndex={activeTab === idx ? 0 : -1}
                className={`px-4 py-2 md:px-6 text-sm md:text-base font-semibold focus:outline-none transition border-b-2 ${activeTab === idx ? 'border-yellow-500 text-yellow-900 bg-yellow-50' : 'border-transparent text-gray-700'}`}
                onClick={() => setActiveTab(idx)}
                animate={{ scale: activeTab === idx ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                type="button"
                aria-label={tab}
                title={tab}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') setActiveTab((idx + 1) % TAB_LIST.length);
                  if (e.key === 'ArrowLeft') setActiveTab((idx - 1 + TAB_LIST.length) % TAB_LIST.length);
                }}
              >
                {tab}
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Main Content */}
      <div id="prediction-pdf-root" className="w-full bg-white py-6 px-2 sm:px-4 lg:px-6 rounded-none">
        {/* Tab Panels */}
        {TAB_LIST.map((tab, idx) => (
          <div
            key={tab}
            id={`tabpanel-${idx}`}
            role="tabpanel"
            aria-labelledby={`tab-${idx}`}
            hidden={activeTab !== idx}
            className={`tab-panel w-full ${activeTab === idx ? 'block' : 'hidden'} py-6`}
          >
            <h2 className="text-lg font-bold mb-2">{tab}</h2>
            {/* Birth Data Tab */}
            {tab === 'Birth Data' && (
              <div className="w-full max-w-3xl mx-auto">
                {canEdit && !isReadOnly ? (
                  <BirthDataForm
                    onSubmit={async (data) => {
                      setLoading(true);
                      setError('');
                      try {
                        await setDoc(doc(db, 'horoscopes', docId!), {
                          ...horoscope,
                          ...data,
                        }, { merge: true });
                        setHoroscope((prev: any) => ({ ...prev, ...data }));
                      } catch (e) {
                        setError('Failed to save birth data');
                      }
                      setLoading(false);
                    }}
                    loading={loading}
                    error={error}
                    initialData={horoscope}
                  />
                ) : (
                  <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-semibold">Full Name:</span> {horoscope.fullName}</div>
                    <div><span className="font-semibold">Gender:</span> {horoscope.gender}</div>
                    <div><span className="font-semibold">Father's Name:</span> {horoscope.fatherName}</div>
                    <div><span className="font-semibold">Family Name:</span> {horoscope.familyName}</div>
                    <div><span className="font-semibold">Gothram:</span> {horoscope.gothram}</div>
                    <div><span className="font-semibold">Date of Birth:</span> {horoscope.dateOfBirth}</div>
                    <div><span className="font-semibold">Time of Birth:</span> {horoscope.timeOfBirth}</div>
                    <div><span className="font-semibold">Place of Birth:</span> {horoscope.placeOfBirth || horoscope.locationName}</div>
                    <div><span className="font-semibold">Latitude:</span> {horoscope.latitude}</div>
                    <div><span className="font-semibold">Longitude:</span> {horoscope.longitude}</div>
                    <div><span className="font-semibold">Full Address:</span> {horoscope.fullAddress}</div>
                  </div>
                )}
              </div>
            )}
            {/* Live chart/prediction data rendering */}
            {tab === 'Rasi/Navam' ? (
  <RasiNavamCharts
    horoscope={horoscope}
    canEdit={canEdit}
    isReadOnly={isReadOnly}
    docId={docId!}
    setHoroscope={setHoroscope}
  />
) : tab !== 'Birth Data' && (
              <div className="mb-4 text-gray-700">
                {horoscope?.predictions?.[tab] || horoscope?.chartData?.[tab] || horoscope?.aiInsights?.[tab] || (
                  <span>No data available for <span className="font-semibold">{tab}</span>.</span>
                )}
              </div>
            )}
            {/* Role-aware feedback tools (hide for public/anonymous users) */}
            {canEdit && !isReadOnly && idx !== 13 && idx !== 14 && (
              <form className="flex flex-col gap-2 md:flex-row md:gap-4 items-center mb-4" onSubmit={e => { e.preventDefault(); submitFeedback(tab); }}>
                <label htmlFor={`confidence-${tab}`} className="font-medium">Confidence:</label>
                <input id={`confidence-${tab}`} type="range" min={0} max={100} value={feedback[tab]?.confidence || 50} onChange={e => handleFeedbackChange(tab, 'confidence', Number(e.target.value))} className="w-40" aria-label="Confidence slider" title="Confidence slider" />
                <span>{feedback[tab]?.confidence || 50}%</span>
                <label htmlFor={`correction-${tab}`} className="font-medium ml-4">Correction:</label>
                <input id={`correction-${tab}`} type="text" value={feedback[tab]?.correction || ''} onChange={e => handleFeedbackChange(tab, 'correction', e.target.value)} className="border px-2 py-1 rounded" aria-label="Correction" title="Correction" />
                <label htmlFor={`gold-${tab}`} className="font-medium ml-4">Mark as Gold:</label>
                <input id={`gold-${tab}`} type="checkbox" checked={feedback[tab]?.gold || false} onChange={e => handleFeedbackChange(tab, 'gold', e.target.checked)} aria-label="Mark as Gold" title="Mark as Gold" />
                <button type="submit" className="ml-4 px-3 py-1 bg-green-100 rounded hover:bg-green-200" aria-label="Submit Feedback" title="Submit Feedback">Submit Feedback</button>
              </form>
            )}
            {canEdit && !isReadOnly && idx !== 13 && idx !== 14 && (
              <div className="flex gap- mb-">
                <button className={`px-2 py-1 rounded ${feedback[tab]?.thumb === 'up' ? 'bg-green-200' : 'bg-gray-100'}`} onClick={() => handleFeedbackChange(tab, 'thumb', 'up')} aria-label="Thumbs up" title="Thumbs up">👍</button>
                <button className={`px-2 py-1 rounded ${feedback[tab]?.thumb === 'down' ? 'bg-red-200' : 'bg-gray-100'}`} onClick={() => handleFeedbackChange(tab, 'thumb', 'down')} aria-label="Thumbs down" title="Thumbs down">👎</button>
              </div>
            )}
            {/* PDF Export Tab */}
            {tab === 'PDF Export' && (canExport || isReadOnly) && (
              <div className="mt-4">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded font-bold shadow hover:bg-yellow-600"
                  onClick={handleExportPDF}
                  disabled={pdfLoading}
                  aria-label="Export Prediction as PDF"
                  title="Export Prediction as PDF"
                >
                  {pdfLoading ? 'Exporting...' : 'Export Prediction as PDF'}
                </button>
                {/* PDF content preview (optional) */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="font-medium">Reference QR:</span>
                  <QRCodeCanvas value={window.location.href} size={64} />
                </div>
              </div>
            )}
            {/* Client Feedback Tab (if shared) */}
            {tab === 'Client Feedback' && shareWithClient && (
              <div className="mt-4">Client feedback tools go here (read-only for clients unless shared).</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// --- RasiNavamCharts: Handles chart data fetching, rendering, and manual regeneration ---
type RasiNavamChartsProps = {
  horoscope: any;
  canEdit: boolean;
  isReadOnly: boolean;
  docId: string;
  setHoroscope: (h: any) => void;
};

const RasiNavamCharts: React.FC<RasiNavamChartsProps> = ({ horoscope, canEdit, isReadOnly, docId, setHoroscope }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rasiData, setRasiData] = React.useState<PlanetPlacement[] | null>(null);
  const [navamsaData, setNavamsaData] = React.useState<PlanetPlacement[] | null>(null);
  const { userRole } = useAuth();

  // Helper: fetch and update chart data
  const fetchChartData = async (overwrite = false) => {
    setLoading(true);
    setError(null);
    try {
      const { dateOfBirth, timeOfBirth, locationName, latitude, longitude } = horoscope;
      if (!dateOfBirth || !timeOfBirth || !latitude || !longitude) {
        setError('Missing birth details for chart computation.');
        setLoading(false);
        return;
      }
      const chartData = await getChartData({
        dateOfBirth,
        timeOfBirth,
        locationName: locationName || horoscope.placeOfBirth || '',
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      // Update Firestore
      await setDoc(doc(db, 'horoscopes', docId), { chartData: { ...horoscope.chartData, ...chartData } }, { merge: true });
      setHoroscope((prev: any) => ({ ...prev, chartData: { ...prev.chartData, ...chartData } }));
      setRasiData(chartData.rasi);
      setNavamsaData(chartData.navamsa);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch chart data.');
    } finally {
      setLoading(false);
    }
  };

  // On mount: load or fetch chart data
  React.useEffect(() => {
    const rasi = horoscope?.chartData?.rasi;
    const navamsa = horoscope?.chartData?.navamsa;
    setRasiData(rasi || null);
    setNavamsaData(navamsa || null);
    if (!rasi || !navamsa) {
      fetchChartData();
    }
  }, [horoscope?.chartData]);

  const canRegenerate = userRole === 'admin' || userRole === 'astrologer';

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex flex-col items-center">
        {canRegenerate && !isReadOnly && (
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 disabled:opacity-60"
            onClick={() => fetchChartData(true)}
            disabled={loading}
            aria-label="Regenerate Charts"
            title="Regenerate Charts"
          >
            {loading ? 'Regenerating...' : 'Regenerate Charts'}
          </button>
        )}
      </div>
      {loading ? (
        <div className="w-full flex justify-center items-center py-8"><span className="animate-spin mr-2">🔄</span>Loading chart data...</div>
      ) : error ? (
        <div className="w-full text-center text-red-600 py-4">{error}</div>
      ) : (rasiData?.length || navamsaData?.length) ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start">
          <div className="flex flex-col items-center w-full">
            <h3 className="font-bold text-lg mb-2">Rasi Chart</h3>
            <div className="w-full flex justify-center">
              <RasiChart data={rasiData || []} />
            </div>
          </div>
          <div className="flex flex-col items-center w-full">
            <h3 className="font-bold text-lg mb-2">Navamsa Chart</h3>
            <div className="w-full flex justify-center">
              <NavamsaChart data={navamsaData || []} />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full text-center text-gray-500 py-8">Chart data unavailable for Rasi/Navam.</div>
      )}
    </div>
  );
};

export default PredictionView;
