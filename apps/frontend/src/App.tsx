import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import PredictionPage from "./pages/PredictionPage";
import ChatPage from "./pages/ChatPage";
import NewHoroscopePage from "./pages/NewHoroscopePage";

import { fetchPrediction } from "./services/api";
import TestPrediction from "./pages/TestPrediction";
import HeaderNav from "./components/HeaderNav";
import { ErrorBoundary } from "./components/ErrorBoundary";

interface PredictionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface PredictionPageProps {
  prediction: PredictionResponse | null;
}

function App() {
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black text-white font-sans">
          <HeaderNav />

          <main className="p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/login" element={<Login />} />
              <Route path="/prediction" element={<PredictionPage prediction={predictionResult} />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/new-horoscope" element={<NewHoroscopePage />} />
              <Route path="/test-prediction" element={<TestPrediction />} />
              <Route path="/birth-data" element={<NewHoroscopePage />} />
              <Route path="*" element={<div className="text-center py-8 text-red-500">404 - Page Not Found</div>} />
            </Routes>
          </main>

          <footer className="text-center text-xs text-gray-400 py-6">
            2025 AstroBalendar | Privacy | Terms | Contact
          </footer>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
