import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to AstroBalendar</h1>
      <p className="mb-4">Your astrology calendar and event planner.</p>
    </div>
  );
}

function Calendar() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Calendar</h2>
      <p>Calendar and events will be displayed here.</p>
    </div>
  );
}

function Login() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <p>Login form will be here.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="bg-blue-600 text-white p-4 flex space-x-4">
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
