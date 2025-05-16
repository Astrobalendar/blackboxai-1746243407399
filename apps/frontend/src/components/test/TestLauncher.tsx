import React, { useState } from 'react';
import TestSessionView from './TestSessionView';

const TestLauncher: React.FC = () => {
  const [active, setActive] = useState(false);

  return (
    <div>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
        onClick={() => setActive(true)}
      >
        Start Horoscope Test Flow
      </button>
      {active && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setActive(false)}
              aria-label="Close"
            >✕</button>
            <TestSessionView onComplete={() => setActive(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestLauncher;
