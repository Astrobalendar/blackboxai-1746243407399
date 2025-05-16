import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
// [Google Deprecation Notice] AutocompleteService is deprecated for new customers. See https://developers.google.com/maps/documentation/javascript/places-migration-overview for migration to AutocompleteSuggestion when available in @react-google-maps/api.
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore integration
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import GaneshaImg from '../../assets/ganesha.png';
const GaneshaImg = "https://upload.wikimedia.org/wikipedia/commons/0/0c/Ganesha_Basohli_miniature_circa_1730.jpg"; // Placeholder, ensure this exists or use a public URL

// --- Mock Data ---
import PredictionTopicCards from './PredictionTopicCards';
const mockPrediction = {
  fullName: 'Priya Sharma',
  tob: '14:35',
  dob: '1990-06-15',
  pob: 'Mumbai, India',
  rectifiedTime: '14:37',
  ayanamsa: 'Lahiri',
  lagna: 'Taurus',
  lagnaDeg: "24° 19' 25\"",
  currentDate: '18-04-2025',
  currentTime: '05:11:08 AM',
  rulingPlanets: {
    dayLord: 'Venus',
    lagna: ['Ju', 'Ke', 'So', 'Ku', 'SSSL'],
    moon: ['Ju', 'Ke', 'So', 'Ku', 'SSSL'],
  },
  tithi: 'Panchami (Krishna)',
  star: 'Moola (1)',
  dasa: 'Ket',
  bhukti: 'Sun',
  antara: 'Mars',
  dasaBalance: 'Ke 08Y, 10M, 23D',
  dasaDays: '365.25',
  dasaChain: [
    { name: 'Dasa', value: 8 },
    { name: 'Bhukti', value: 5 },
    { name: 'Sookshma', value: 2 }
  ],
  planetStrength: [
    { name: 'Sun', value: 80 },
    { name: 'Moon', value: 60 },
    { name: 'Mars', value: 70 },
    { name: 'Mercury', value: 50 },
    { name: 'Jupiter', value: 90 },
    { name: 'Venus', value: 75 },
    { name: 'Saturn', value: 65 }
  ],
  planetPositions: [
    { planet: 'Sun', rasi: 'Taurus', star: 'Krittika', padham: '2', sublord: 'Venus' },
    { planet: 'Moon', rasi: 'Sagittarius', star: 'Moola', padham: '1', sublord: 'Saturn' },
    // ...
  ],
  panchang: {
    sunrise: '06:25:32 AM',
    sunset: '06:52:24 PM',
    yoga: 'Parigha',
    karana: 'Taitil',
    hora: 'Moon',
    localMeanTime: 'IST -09:27',
  },
  notes: 'You will have a prosperous year with strong support from Jupiter and Venus. Focus on your career and health.'
};

interface KPStellarPredictionViewProps {
  prediction: any;
  editable?: boolean;
  googleMapsApiKey: string;
  exportFileName?: string;
}

interface KPStellarPredictionViewProps {
  prediction: any;
  editable?: boolean;
  googleMapsApiKey: string;
  exportFileName?: string;
  user: any; // Pass the user object from auth context
}

export const KPStellarPredictionView: React.FC<KPStellarPredictionViewProps> = ({ prediction: initialPrediction, editable = false, googleMapsApiKey, exportFileName, user }) => {
  const [prediction, setPrediction] = useState<any>(initialPrediction);
  const [loading, setLoading] = useState<boolean>(!initialPrediction);
  const [editMode, setEditMode] = useState(editable);

  // Auto-load prediction from Firestore if not provided
  useEffect(() => {
    if (!initialPrediction) {
      const fetchPrediction = async () => {
        setLoading(true);
        try {
          const db = getFirestore();
          // Adjust the doc path as per your Firestore structure
          const docRef = doc(db, 'predictions', 'current');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPrediction(docSnap.data());
          } else {
            setPrediction(mockPrediction);
          }
        } catch (e) {
          setPrediction(mockPrediction);
        }
        setLoading(false);
      };
      fetchPrediction();
    }
  }, [initialPrediction]);

  // Compute color for Radar fill based on planet strengths
  let radarFill = '#22c55e'; // default: dark green
  if (prediction.planetStrength && prediction.planetStrength.length > 0) {
    const maxValue = Math.max(...prediction.planetStrength.map((entry: { value: number }) => entry.value));
    if (maxValue <= 25) radarFill = '#ef4444'; // red
    else if (maxValue <= 50) radarFill = '#3b82f6'; // blue
    else if (maxValue <= 75) radarFill = '#bbf7d0'; // light green
  }

  // --- Google Maps Autocomplete ---
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: ['places'],
  });
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const onPlaceChanged = () => {
    if (autocomplete) {
      setPrediction((prev: any) => ({ ...prev, pob: autocomplete.getPlace().formatted_address }));
    }
  };

  // Sync prediction prop -> state
  useEffect(() => {
    setPrediction(initialPrediction);
  }, [initialPrediction]);

  // --- Export Functions ---
  const handleExportPDF = async () => {
    const input = document.getElementById('kp-prediction-root');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('KP_Prediction_Report.pdf');
  };
  const handleExportPNG = async () => {
    const input = document.getElementById('kp-prediction-root');
    if (!input) return;
    const canvas = await html2canvas(input);
    const img = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = img;
    link.download = 'KP_Prediction_Report.png';
    link.click();
  };

  // --- Editable Handler ---
  const handleChange = (field: string, value: any) => {
    setPrediction((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- Responsive, Glassmorphic, Animated UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-green-100 flex flex-col items-center py-8 px-2">
      <motion.div id="kp-prediction-root" className="w-full max-w-6xl bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-yellow-200" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Left Panel */}
        <div className="md:w-1/3 w-full flex flex-col items-center p-6 bg-white/30 border-r border-yellow-200">
          <img src={GaneshaImg} alt="Ganesha" className="w-24 h-24 mb-2 rounded-full shadow-lg border-4 border-yellow-200 bg-yellow-50" />
          <div className="text-yellow-800 text-lg font-bold mb-1">Current Lagna</div>
          <div className="text-xl font-extrabold text-green-800 mb-3">{prediction.lagna} <span className="text-yellow-700">{prediction.lagnaDeg}</span></div>
          <div className="w-full bg-white/60 rounded-xl shadow p-3 mb-4">
            <div className="font-semibold text-yellow-700 mb-1">Ruling Planets</div>
            <div className="flex flex-col gap-1 text-sm">
              <div>Day Lord: <span className="font-bold text-green-700">{prediction.rulingPlanets.dayLord}</span></div>
              <div>Lagna: {prediction.rulingPlanets.lagna.join(', ')}</div>
              <div>Moon: {prediction.rulingPlanets.moon.join(', ')}</div>
            </div>
            <div>Place: {editMode && isLoaded ? (
              <>
                <label htmlFor="pob-input" className="sr-only">Place of Birth</label>
                <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                  <input
                    id="pob-input"
                    className="border-b border-yellow-400 bg-transparent outline-none px-1"
                    value={prediction.pob}
                    onChange={e => handleChange('pob', e.target.value)}
                    placeholder="Enter place of birth"
                    title="Place of Birth"
                  />
                </Autocomplete>
              </>
            ) : (
              <span>{prediction.pob}</span>
            )}
            </div>
            <div>Ayanamsa: {prediction.ayanamsa}</div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="md:w-2/3 w-full flex flex-col gap-4 p-6 bg-white/20 relative">
          {/* Sticky Export Buttons */}
          <div className="absolute right-6 top-6 flex gap-2 z-10">
            <button onClick={handleExportPDF} className="px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow">Export PDF</button>
            <button onClick={handleExportPNG} className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold shadow">Export PNG</button>
          </div>
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-2">
            {['Overview', 'Dasa Timeline', 'Strength Charts', 'Sublord Mapping', 'Export Center'].map(tab => (
              <div key={tab} className="px-3 py-1 rounded-full bg-yellow-300/60 text-yellow-900 font-semibold cursor-pointer hover:bg-yellow-400 transition">{tab}</div>
            ))}
          </div>
          {/* Prediction Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tithi & Star */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
              <div className="font-bold text-green-800">Tithi</div>
              <div>{prediction.tithi}</div>
              <div className="font-bold text-green-800 mt-2">Star</div>
              <div>{prediction.star}</div>
            </div>
            {/* Dasa/Bhukti/Antara */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
              <div className="font-bold text-green-800">Dasa</div>
              <div>{prediction.dasa}</div>
              <div className="font-bold text-green-800 mt-2">Bhukti</div>
              <div>{prediction.bhukti}</div>
              <div className="font-bold text-green-800 mt-2">Antara</div>
              <div>{prediction.antara}</div>
              <div className="font-bold text-yellow-700 mt-2">Dasa Balance</div>
              <div>{prediction.dasaBalance}</div>
            </div>
            {/* Planet Positions */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg col-span-2">
              <div className="font-bold text-green-800 mb-2">Planet Positions</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-yellow-800 font-bold">
                      <th className="px-2">Planet</th>
                      <th className="px-2">Rasi</th>
                      <th className="px-2">Star</th>
                      <th className="px-2">Padham</th>
                      <th className="px-2">Sublord</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.planetPositions.map((p: any) => (
                      <tr key={p.planet} className="hover:bg-yellow-50">
                        <td className="px-2 font-semibold text-green-700">{p.planet}</td>
                        <td className="px-2">{p.rasi}</td>
                        <td className="px-2">{p.star}</td>
                        <td className="px-2">{p.padham}</td>
                        <td className="px-2">{p.sublord}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Dasa Chain Timeline */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
              <div className="font-bold text-green-800 mb-2">Dasa Chain Timeline</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={prediction.dasaChain}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#facc15" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Planet Strength Chart */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
              <div className="font-bold text-green-800 mb-2">Planet Strength %</div>
              <ResponsiveContainer width="100%" height={120}>
                <RadarChart data={prediction.planetStrength}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Strength" dataKey="value" stroke="#facc15" fill={radarFill} fillOpacity={0.7} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Panchang Details */}
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg col-span-2">
              <div className="font-bold text-green-800 mb-2">Panchang & Hora</div>
              <div className="flex flex-wrap gap-4 text-xs">
                <div><span className="font-bold">Yoga:</span> {prediction.panchang.yoga}</div>
                <div><span className="font-bold">Karana:</span> {prediction.panchang.karana}</div>
                <div><span className="font-bold">Hora:</span> {prediction.panchang.hora}</div>
                <div><span className="font-bold">Sunrise:</span> {prediction.panchang.sunrise}</div>
                <div><span className="font-bold">Sunset:</span> {prediction.panchang.sunset}</div>
                <div><span className="font-bold">Local Mean Time:</span> {prediction.panchang.localMeanTime}</div>
              </div>
            </div>
            {/* Modular Topic-Based Prediction Analysis */}
            <div className="col-span-2">
              <PredictionTopicCards
                rawText={prediction.notes || ''}
                user={user}
                horoscopeId={prediction.horoscopeId || 'default'}
                editable={editMode}
              />
            </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

