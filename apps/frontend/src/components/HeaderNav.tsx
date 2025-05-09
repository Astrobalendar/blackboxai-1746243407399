import React from "react";
import { Link } from "react-router-dom";

const HeaderNav: React.FC = () => {
  return (
    <nav className="bg-yellow-600 shadow-lg py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white tracking-wide">🔮 AstroBalendar</h1>
      <div className="space-x-4 flex items-center">
        <Link to="/" className="text-white hover:underline">Home</Link>
        <Link to="/calendar" className="text-white hover:underline">Calendar</Link>
        <Link to="/chat" className="text-white hover:underline">Chat</Link>
        <Link to="/new-horoscope" className="text-white hover:underline">New Horoscope</Link>
        <Link to="/birth-data" className="text-white hover:underline">Birth Data</Link>
        <Link to="/login">
          <button type="button" className="ml-4 bg-white text-yellow-700 px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 transition">Login</button>
        </Link>
        <Link to="/signup">
          <button type="button" className="ml-2 bg-yellow-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-yellow-800 transition">Sign Up</button>
        </Link>
      </div>
    </nav>
  );
};

export default HeaderNav;