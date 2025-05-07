import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import PredictionPage from "./pages/PredictionPage";
import ChatPage from "./pages/ChatPage";
import NewHoroscopePage from "./pages/NewHoroscopePage";
import BirthDataForm from "./components/BirthDataForm";
import HeaderNav from "./components/HeaderNav";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black text-white font-sans">
        <HeaderNav /> {/* Ensure HeaderNav does not include another BrowserRouter */}
        <header className="bg-yellow-600 shadow-lg py-4 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wide">🔮 AstroBalendar</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/calendar" className="hover:underline">Calendar</Link>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/chat" className="hover:underline">Chat</Link>
            <Link to="/new-horoscope" className="hover:underline">New Horoscope</Link>
            <Link to="/birth-data" className="hover:underline">Birth Data</Link> {/* New Link */}
          </nav>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/prediction" element={<PredictionPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/new-horoscope" element={<NewHoroscopePage onPrediction={(data) => console.log(data)} />} />
            <Route path="/birth-data" element={<BirthDataForm />} /> {/* New Route */}
          </Routes>
        </main>

        <footer className="text-center text-xs text-gray-400 py-6">
          © 2025 AstroBalendar | Privacy | Terms | Contact
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
