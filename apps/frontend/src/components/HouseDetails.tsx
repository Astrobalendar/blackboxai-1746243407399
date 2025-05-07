import React from 'react';
import { motion } from 'framer-motion';

interface Planet {
  name: string;
  strength: string;
  sign: string;
  aspects: string[];
}

interface KPDetails {
  subLord: string;
  subPeriod: string;
}

interface Aspects {
  from: string[];
  to: string[];
}

interface HouseData {
  title: string;
  planets: Planet[];
  KP: KPDetails;
  significance: string;
  dashaEffects: string;
  aspects: Aspects;
}

interface HouseDetailsProps {
  houseNumber: number;
  onClose: () => void;
}

const houseData: Record<number, HouseData> = {
  1: {
    title: "1st House (Lagna)",
    planets: [{ name: "Sun", strength: "Strong", sign: "Leo", aspects: ["4th", "7th", "10th"] }],
    KP: { subLord: "Sun", subPeriod: "2025-2026" },
    significance: "Represents self, personality, and physical body",
    dashaEffects: "Current dasha strongly influences personality traits",
    aspects: {
      from: ["4th", "7th", "10th"],
      to: ["7th", "10th", "4th"]
    }
  },
  // Add data for other houses similarly
};

const HouseDetails: React.FC<HouseDetailsProps> = ({ houseNumber, onClose }: HouseDetailsProps) => {
  const house: HouseData | undefined = houseData[houseNumber];
  
  if (!house) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-purple-800">{house.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Planet Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-purple-600">Planets</h4>
          {house.planets.map((planet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-4 border-purple-200 pl-4 space-y-2"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">🌞</span>
                <div className="space-y-1">
                  <p className="font-medium">{planet.name}</p>
                  <p className="text-sm text-gray-600">Strength: {planet.strength}</p>
                  <p className="text-sm text-gray-600">Sign: {planet.sign}</p>
                </div>
              </div>
              <div className="mt-2 border-t pt-2">
                <p className="text-sm text-gray-600">Aspects: {planet.aspects.join(', ')}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* KP Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-purple-600">KP Details</h4>
          <div className="border-l-4 border-purple-200 pl-4 space-y-2">
            <p className="font-medium">Sub-Lord: {house.KP.subLord}</p>
            <p className="text-sm text-gray-600">Sub-Period: {house.KP.subPeriod}</p>
          </div>
        </motion.div>

        {/* Significance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-purple-600">Significance</h4>
          <div className="border-l-4 border-purple-200 pl-4">
            <p className="text-gray-600">{house.significance}</p>
          </div>
        </motion.div>

        {/* Dasha Effects */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-purple-600">Dasha Effects</h4>
          <div className="border-l-4 border-purple-200 pl-4">
            <p className="text-gray-600">{house.dashaEffects}</p>
          </div>
        </motion.div>

        {/* Aspects */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-purple-600">Aspects</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-4 border-purple-200 pl-4">
              <h5 className="font-medium">From This House</h5>
              <p className="text-gray-600">{house.aspects.from.join(', ')}</p>
            </div>
            <div className="border-l-4 border-purple-200 pl-4">
              <h5 className="font-medium">To This House</h5>
              <p className="text-gray-600">{house.aspects.to.join(', ')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HouseDetails;
