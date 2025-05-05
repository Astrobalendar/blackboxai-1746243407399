import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RasiChart from '../components/RasiChart';
import NavamsaChart from '../components/NavamsaChart';
import { downloadPredictionPdf } from '../services/calendarService';

interface PredictionData {
  rasiData: number[];
  rasiLabels: string[];
  navamsaData: number[];
  navamsaLabels: string[];
  rulingPlanets: string[];
  interpretation: string;
}

const PredictionResult: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrediction() {
      setLoading(true);
      try {
        // Fetch prediction data from backend API
        const response = await fetch(`/api/kp/predict/${id}`);
        const data = await response.json();
        setPrediction(data);
      } catch (error) {
        console.error('Error fetching prediction:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrediction();
  }, [id]);

  if (loading) {
    return <div className="text-center p-4">{t('predictionResult.loading')}</div>;
  }

  if (!prediction) {
    return <div className="text-center p-4">{t('predictionResult.notFound')}</div>;
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-live="polite"
    >
      <h1 className="text-3xl font-bold text-center mb-4">{t('predictionResult.title')}</h1>

      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        aria-label={t('predictionResult.rasiChart')}
      >
        <RasiChart data={prediction.rasiData} labels={prediction.rasiLabels} />
        <NavamsaChart data={prediction.navamsaData} labels={prediction.navamsaLabels} />
      </motion.section>

      <motion.section
        className="bg-white p-4 rounded shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        aria-label={t('predictionResult.rulingPlanets')}
      >
        <h2 className="text-xl font-semibold mb-2">{t('predictionResult.rulingPlanets')}</h2>
        <ul className="list-disc list-inside">
          {prediction.rulingPlanets.map((planet, index) => (
            <li key={index}>{planet}</li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className="bg-white p-4 rounded shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        aria-label={t('predictionResult.interpretation')}
      >
        <h2 className="text-xl font-semibold mb-2">{t('predictionResult.interpretation')}</h2>
        <p>{prediction.interpretation}</p>
      </motion.section>

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <button
          onClick={() => downloadPredictionPdf(id!)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          aria-label={t('predictionResult.downloadPdf')}
        >
          {t('predictionResult.downloadPdf')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PredictionResult;
