// src/components/HeaderNav.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderNav = () => {
  return (
    <nav className="bg-yellow-700 text-white p-4 flex justify-between items-center shadow">
      <div className="text-lg font-bold">🔯 AstroBalendar</div>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/login">Login</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/new-horoscope">New Horoscope</Link>

        <div className="relative group inline-block">
          <button className="hover:underline">Prediction View ▼</button>
          <div className="absolute z-10 hidden group-hover:block bg-white text-black mt-2 rounded shadow-lg">
            <Link to="/prediction/birth-data" className="block px-4 py-2 hover:bg-gray-100">Birth Data</Link>
            <Link to="/prediction/rasi" className="block px-4 py-2 hover:bg-gray-100">Rasi / Navamsam</Link>
            <Link to="/prediction/bhava" className="block px-4 py-2 hover:bg-gray-100">Bhava / Planet</Link>
            <Link to="/prediction/cuspal-links" className="block px-4 py-2 hover:bg-gray-100">Cuspal Links</Link>
            <Link to="/prediction/dasabukthi" className="block px-4 py-2 hover:bg-gray-100">Dasabukthi</Link>
            <Link to="/prediction/full-chart" className="block px-4 py-2 hover:bg-gray-100">Full Chart</Link>
            <Link to="/prediction/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
            <Link to="/prediction/about" className="block px-4 py-2 hover:bg-gray-100">About</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderNav;
