import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 text-yellow-900">
      <header className="w-full bg-yellow-500 shadow-lg py-4 px-0 flex items-center justify-center fixed top-0 left-0 z-50">
        <div className="text-2xl font-bold text-yellow-900 tracking-wide">AstroBalendar</div>
      </header>
      <main className="mt-20 w-full px-[6mm]">
        {/* Welcome message */}
        <section className="w-full flex flex-col items-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-wide text-yellow-900 drop-shadow-sm mb-2">AstroBalendar</h1>
          <p className="text-lg font-medium text-yellow-800 mb-4 text-center">
            Welcome to your multilingual astrology platform.<br/>
            Explore Panchangam, Festivals, Horoscope, Auspicious Timings, Moon Phase, News, and more!
          </p>
        </section>
          {/* Horoscope, News, and Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 h-full">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Moon Phase</h2>
              <p className="text-sm text-yellow-900">Waxing Gibbous<br/>Illumination: 78%<br/>Next Full Moon: 2025-05-12</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 h-full">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Festival Spotlight</h2>
              <p className="text-sm text-yellow-900"><b>Akshaya Tritiya</b> (2025-05-07)<br/>A highly auspicious day for new beginnings, wealth, and spiritual growth.</p>
            </div>
          </div>
          {/* Horoscope grid */}
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-6 w-full mb-8">
            <h2 className="text-lg font-bold text-yellow-800 mb-4 text-center">Daily Horoscope</h2>
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
                {/* Row 1: Aries, Taurus, Gemini, Cancer */}
                {['Aries','Taurus','Gemini','Cancer'].map(sign => (
                  <div key={sign} className="bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 border border-yellow-100 rounded-2xl p-6 text-center shadow flex flex-col justify-center items-center min-h-[120px] h-full transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="font-semibold text-orange-700 text-lg">{sign}</div>
                    <div className="text-xs text-orange-800 mt-1">Today: Good prospects!</div>
                  </div>
                ))}
                {/* Row 2: Leo, Virgo, Libra, Scorpio */}
                {['Leo','Virgo','Libra','Scorpio'].map(sign => (
                  <div key={sign} className="bg-gradient-to-br from-green-100 via-lime-100 to-yellow-50 border border-yellow-100 rounded-2xl p-6 text-center shadow flex flex-col justify-center items-center min-h-[120px] h-full transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="font-semibold text-green-700 text-lg">{sign}</div>
                    <div className="text-xs text-green-800 mt-1">Today: Good prospects!</div>
                  </div>
                ))}
                {/* Row 3: Sagittarius, Capricorn, Aquarius, Pisces */}
                {['Sagittarius','Capricorn','Aquarius','Pisces'].map(sign => (
                  <div key={sign} className="bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 border border-yellow-100 rounded-2xl p-6 text-center shadow flex flex-col justify-center items-center min-h-[120px] h-full transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="font-semibold text-sky-700 text-lg">{sign}</div>
                    <div className="text-xs text-sky-800 mt-1">Today: Good prospects!</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* News and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 h-full">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Astrology News</h2>
              <ul className="text-sm text-yellow-900">
                <li><b>Venus enters Gemini</b> (2025-04-30) — This transit brings communication and charm to relationships.</li>
                <li><b>Lunar Eclipse Next Week</b> (2025-05-06) — A penumbral lunar eclipse will be visible in India.</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 h-full">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Significance of Temple Festivals</h2>
              <p className="text-sm text-yellow-900">Why festivals matter in astrological tradition.<br/>How to read your horoscope.<br/>Understanding the flow of time in the Hindu calendar.</p>
            </div>
          </div>
          {/* Action buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 w-full">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 px-6 rounded-2xl shadow transition">Prasannam</button>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 px-6 rounded-2xl shadow transition">Get Prediction</button>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 px-6 rounded-2xl shadow transition">Matchmaking</button>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 px-6 rounded-2xl shadow transition">Contact Astrologer</button>
          </div>
        </main>
    </div>
  );
};

export default Home;
