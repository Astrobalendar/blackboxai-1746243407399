import React from "react";
import { Link } from "react-router-dom";

const HeaderNav: React.FC = () => {
  return (
    <nav className="bg-yellow-600 shadow-lg py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white tracking-wide">🔮 AstroBalendar</h1>
      <div className="space-x-4">
        <Link to="/" className="text-white hover:underline">Home</Link>
        <Link to="/calendar" className="text-white hover:underline">Calendar</Link>
        <Link to="/login" className="text-white hover:underline">Login</Link>
        <Link to="/chat" className="text-white hover:underline">Chat</Link>
        <Link to="/new-horoscope" className="text-white hover:underline">New Horoscope</Link>
        <Link to="/birth-data" className="text-white hover:underline">Birth Data</Link>
      </div>
    </nav>
  );
};

export default HeaderNav;