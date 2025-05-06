import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-purple-900 via-black to-black text-white">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-wide">🔮 AstroBalendar</h1>
        <p className="mt-4 text-lg">The World's First AI/ML-Based Astrology Platform</p>
      </header>

      {/* Full-width grid section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 sm:px-8 md:px-12 lg:px-20 w-full">
        {[
          "Daily Predictions",
          "Matchmaking",
          "Zodiac Scoring",
          "Offline Support",
          "PDF Reports",
          "Multi-language"
        ].map((feature) => (
          <div
            key={feature}
            className="bg-white/10 p-6 rounded-xl border border-purple-500 shadow-lg text-center"
          >
            <h3 className="text-xl font-semibold">{feature}</h3>
          </div>
        ))}
      </section>

      <div className="text-center mt-10 space-x-4">
        <Link to="/prediction">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold">
            Get Your Prediction
          </button>
        </Link>
        <Link to="/calendar">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded text-white font-semibold">
            View Astro Calendar
          </button>
        </Link>
      </div>

      <footer className="mt-20 text-center text-sm text-white/70 py-6">
        © 2025 AstroBalendar | Privacy | Terms | Contact
      </footer>
    </div>
  );
};

export default Home;
