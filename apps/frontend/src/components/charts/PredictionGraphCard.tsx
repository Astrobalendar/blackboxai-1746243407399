import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as htmlToImage from 'html-to-image';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

export interface PredictionResult {
  prediction: string;
  success: boolean;
  error: string | null;
  predictionId: string;
  // Added for charting
  sunStrength?: number;
  moonStrength?: number;
  marsStrength?: number;
  mercuryStrength?: number;
  jupiterStrength?: number;
  venusStrength?: number;
  saturnStrength?: number;
  dasaDuration?: string;
  bhuktiDuration?: string;
  sookshmaDuration?: string;
  subLordChain?: string[];
}

interface PredictionGraphCardProps {
  prediction: PredictionResult;
  onPlanetClick?: (planet: string) => void;
}

const PredictionGraphCard: React.FC<PredictionGraphCardProps> = ({ prediction, onPlanetClick }) => {
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  // Data transformation for charts
  const planetStrengthData = [
    { subject: 'Sun', value: prediction.sunStrength || 0 },
    { subject: 'Moon', value: prediction.moonStrength || 0 },
    { subject: 'Mars', value: prediction.marsStrength || 0 },
    { subject: 'Mercury', value: prediction.mercuryStrength || 0 },
    { subject: 'Jupiter', value: prediction.jupiterStrength || 0 },
    { subject: 'Venus', value: prediction.venusStrength || 0 },
    { subject: 'Saturn', value: prediction.saturnStrength || 0 },
  ];

  const dasaData = [
    { name: 'Dasa', value: prediction.dasaDuration || 0 },
    { name: 'Bhukti', value: prediction.bhuktiDuration || 0 },
    { name: 'Sookshma', value: prediction.sookshmaDuration || 0 },
  ];

  const handleExport = async () => {
    try {
      const node = document.getElementById('prediction-graph-container');
      if (!node) return;

      const dataUrl = await htmlToImage.toPng(node);
      const link = document.createElement('a');
      link.download = 'prediction-graph.png';
      link.href = dataUrl;
      link.click();
      
      toast.success('Graph exported successfully!');
    } catch (error) {
      toast.error('Failed to export graph');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Prediction Analysis</h2>
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Export Graph
        </button>
      </div>

      <div id="prediction-graph-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart for Planet Strength */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-4 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Planet Strength Distribution</h3>
          <RadarChart cx={150} cy={150} outerRadius={100} width={300} height={300} data={planetStrengthData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar
              name="Planet Strength"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </motion.div>

        {/* Bar Chart for Dasa Chain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-4 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Dasa Chain Timeline</h3>
          <BarChart width={300} height={300} data={dasaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </motion.div>
      </div>

      {/* Sublord Chain View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gray-800 p-4 rounded-lg"
      >
        <h3 className="text-lg font-semibold mb-4">Sublord Chain</h3>
        <div className="grid grid-cols-4 gap-2">
          {prediction.subLordChain?.map((planet, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg cursor-pointer transition-transform duration-200 ${
                activePlanet === planet ? 'bg-blue-600 transform scale-105' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => {
                setActivePlanet(planet);
                onPlanetClick?.(planet);
              }}
            >
              <div className="text-center">
                <span className="text-lg font-bold">{planet}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PredictionGraphCard;
