import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="p-6 bg-yellow-50 rounded-lg shadow-lg max-w-5xl mx-auto mt-8">
      <h1 className="text-4xl font-extrabold text-yellow-800 mb-4 text-center drop-shadow-md">Welcome AstroBalendar</h1>
      <p className="mb-6 text-center text-yellow-900 text-lg max-w-3xl mx-auto">
        Welcome to your multilingual astrology platform. Explore Panchangam, Festivals, Horoscope, Auspicious Timings, Moon Phase, News, and much more!
      </p>
      <div className="flex justify-center mb-8">
        <button className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold py-2 px-6 rounded shadow transition duration-300">
          Get Prediction
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="font-semibold text-blue-700 mb-2">Today's Panchangam</h2>
          <ul className="text-sm text-blue-900">
            <li><strong>Date:</strong> 5/3/2025</li>
            <li><strong>Tithi:</strong> Shukla Paksha Dwadashi</li>
            <li><strong>Nakshatra:</strong> Rohini</li>
            <li><strong>Sunrise:</strong> 06:02 AM</li>
            <li><strong>Sunset:</strong> 06:41 PM</li>
            <li><strong>Rahu Kalam:</strong> 03:00 PM - 04:30 PM</li>
            <li><strong>Yamagandam:</strong> 12:00 PM - 01:30 PM</li>
          </ul>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow border border-yellow-300">
          <h2 className="font-semibold text-yellow-700 mb-2">🎉 Upcoming Festivals & Temple Events</h2>
          <ul className="text-sm text-yellow-900 space-y-2">
            <li><strong>Akshaya Tritiya</strong><br/><small>07/05/2025 • Sri Venkateswara Temple</small></li>
            <li><strong>Vaikasi Visakam</strong><br/><small>23/05/2025 • Meenakshi Amman Temple</small></li>
            <li><strong>Rath Yatra</strong><br/><small>05/07/2025 • Jagannath Temple</small></li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <h2 className="font-semibold text-green-700 mb-2">Auspicious Timings</h2>
          <ul className="text-sm text-green-900">
            <li><strong>Abhijit Muhurta:</strong> 12:05 PM - 12:55 PM</li>
            <li><strong>Brahma Muhurta:</strong> 04:20 AM - 05:10 AM</li>
            <li><strong>Amrit Kalam:</strong> 06:00 AM - 07:30 AM</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h3 className="font-semibold text-blue-700 mb-2">Moon Phase</h3>
          <p>Waxing Gibbous</p>
          <p>Illumination: 78%</p>
          <p>Next Full Moon: 2025-05-12</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Festival Spotlight</h3>
          <p><strong>Akshaya Tritiya (2025-05-07)</strong></p>
          <p>A highly auspicious day for new beginnings, wealth, and spiritual growth.</p>
        </div>
        <div className="bg-pink-100 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Daily Horoscope</h3>
          <div className="grid grid-cols-2 gap-2 text-pink-700 text-sm">
            <div>Aries: Today: Good prospects!</div>
            <div>Taurus: Today: Good prospects!</div>
            <div>Gemini: Today: Good prospects!</div>
            <div>Cancer: Today: Good prospects!</div>
            <div>Leo: Today: Good prospects!</div>
            <div>Virgo: Today: Good prospects!</div>
            <div>Libra: Today: Good prospects!</div>
            <div>Scorpio: Today: Good prospects!</div>
            <div>Sagittarius: Today: Good prospects!</div>
            <div>Capricorn: Today: Good prospects!</div>
            <div>Aquarius: Today: Good prospects!</div>
            <div>Pisces: Today: Good prospects!</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-yellow-400 p-4 rounded shadow text-yellow-900">
          <h3 className="font-semibold mb-2">📰 Astrology News</h3>
          <p>Venus enters Gemini (2025-04-30)</p>
          <p>This transit brings communication and charm to relationships.</p>
          <p>Lunar Eclipse Next Week (2025-05-06)</p>
          <p>A penumbral lunar eclipse will be visible in India.</p>
        </div>
        <div className="bg-yellow-400 p-4 rounded shadow text-yellow-900">
          <h3 className="font-semibold mb-2">📚 ಜ್ಯೋತಿಷ್ಯ ಕಟುರೆಗಳು ಮತ್ತು ಕತ್ತಲು</h3>
          <ul className="list-disc list-inside">
            <li>What is Panchangam?</li>
            <li>How to Read Your Horoscope</li>
            <li>Significance of Temple Festivals</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-yellow-500 p-6 rounded shadow text-yellow-900 text-center cursor-pointer hover:bg-yellow-600 transition">
          Prasannam<br/><small>Click to explore</small>
        </div>
        <div className="bg-yellow-500 p-6 rounded shadow text-yellow-900 text-center cursor-pointer hover:bg-yellow-600 transition">
          Get Prediction<br/><small>Click to explore</small>
        </div>
        <div className="bg-yellow-500 p-6 rounded shadow text-yellow-900 text-center cursor-pointer hover:bg-yellow-600 transition">
          Matchmaking<br/><small>Click to explore</small>
        </div>
        <div className="bg-yellow-500 p-6 rounded shadow text-yellow-900 text-center cursor-pointer hover:bg-yellow-600 transition">
          Contact Astrologer<br/><small>Click to explore</small>
        </div>
      </div>
    </div>
  );
}

function Calendar() {
  return (
    <div className="p-6 max-w-5xl mx-auto mt-8">
      <h2 className="text-3xl font-semibold mb-4">Calendar</h2>
      <p>Calendar and events will be displayed here.</p>
    </div>
  );
}

function Login() {
  return (
    <div className="p-6 max-w-5xl mx-auto mt-8">
      <h2 className="text-3xl font-semibold mb-4">Login</h2>
      <p>Login form will be here.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="bg-yellow-600 text-yellow-100 p-4 flex space-x-4 shadow-md">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/calendar" className="hover:underline">Calendar</Link>
        <Link to="/login" className="hover:underline">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
