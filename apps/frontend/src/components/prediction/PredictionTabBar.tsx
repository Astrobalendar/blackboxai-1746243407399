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
        tabIndex={0}
      >
        {TABS.map((tab, idx) => {
          const isActive = tab === currentTab;
          return (
            <motion.button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${idx}`}
              id={`tab-${idx}`}
              tabIndex={isActive ? 0 : -1}
              className={`px-4 py-2 md:px-6 text-sm md:text-base font-semibold focus:outline-none transition border-b-2 ${isActive ? 'border-yellow-500 text-yellow-900 bg-yellow-50' : 'border-transparent text-gray-700'}`}
              type="button"
              aria-label={tab}
              title={tab}
              onClick={() => {}}
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
