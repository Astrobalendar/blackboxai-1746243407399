import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthProvider';
import { KPStellarPredictionView } from '../components/prediction/KPStellarPredictionView';

const Prediction: React.FC = () => {
  const { horoscopeId } = useParams<{ horoscopeId: string }>();
  const { user } = useAuth();
  // If role is not available, default to non-editable for clients/students
  const editable = false;
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !horoscopeId) return;
      setLoading(true);
      const db = getFirestore();
      // Fetch birth data
      const birthRef = doc(db, `users/${user.uid}/birthData`);
      const birthSnap = await getDoc(birthRef);
      // Fetch prediction data
      const predRef = doc(db, `users/${user.uid}/horoscopes/${horoscopeId}`);
      const predSnap = await getDoc(predRef);
      setPrediction({
        ...(birthSnap.exists() ? birthSnap.data() : {}),
        ...(predSnap.exists() ? predSnap.data() : {}),
      });
      setLoading(false);
    };
    fetchData();
  }, [user, horoscopeId]);

  if (loading) return <div className="p-8 text-center text-lg">Loading prediction...</div>;
  if (!prediction) return <div className="p-8 text-center text-lg text-red-600">Prediction not found.</div>;

  if (!prediction) return <div>Loading...</div>;
  return (
    <KPStellarPredictionView
      prediction={prediction}
      editable={editable}
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      exportFileName={`${prediction.fullName || 'Prediction'}_${prediction.dob || ''}`}
      user={user}
    />
  );
};

export default Prediction;
