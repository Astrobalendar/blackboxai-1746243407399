import React from 'react';
import { motion } from 'framer-motion';

const TABS = [
  'Birth Data',
  'Rasi/Navam',
  'KP Horoscope',
  'Bhava / Planet',
  'Cuspal Links',
  'Planet Ext-1',
  'Cuspal Ext-2',
  'Significators',
  'Old KP Sign',
  'Dasa Bukthi',
  'Full Chart',
  'Settings',
  'Tools',
  'Print',
  'About',
];

interface PredictionTabBarProps {
  activeTab?: string;
}

const PredictionTabBar: React.FC<PredictionTabBarProps> = ({ activeTab }) => {
  // For now, tabs are locked: always highlight the first tab
  const currentTab = activeTab || TABS[0];
  return (
    <nav
      className="w-full overflow-x-auto whitespace-nowrap py-2 px-2 bg-white/10 backdrop-blur rounded-md shadow flex gap-x-2 mb-6 scrollbar-hide"
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Prediction Tabs"
      >
        {TABS.map((tab, idx) => {
          const isActive = tab === currentTab;
          return (
            <motion.button
              key={tab}
              role="tab"
              aria-selected={isActive}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.4, type: 'spring' }}
              whileHover={!isActive ? { boxShadow: '0 0 0 2px #60a5fa, 0 2px 8px #fff4' } : {}}
              className={`inline-block px-3 py-2 rounded-md cursor-default select-none transition-all duration-200 text-base font-medium pointer-events-none opacity-60 ${
                isActive
                  ? 'bg-white/20 border-b-2 border-blue-400 font-semibold text-blue-100 pointer-events-none opacity-100'
                  : 'hover:bg-white/15 text-white'
              }`}
              tabIndex={isActive ? 0 : -1}
              aria-disabled
            >
              {tab}
              {isActive && (
                <motion.span
                  className="ml-2 inline-block align-middle"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  aria-label="Active tab"
                >
                  <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="#60a5fa" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default PredictionTabBar;
