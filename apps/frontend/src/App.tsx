import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AstrologerDashboard from './pages/dashboard/AstrologerDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
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
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black text-white font-sans">
        <HeaderNav />

        <main className="p-4">
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/prediction" element={<PredictionPage prediction={predictionResult} />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/test-prediction" element={<TestPrediction />} />
              <Route path="/new-horoscope" element={
                <PrivateRoute>
                  <NewHoroscopePage />
                </PrivateRoute>
              } />
              <Route path="/dashboard/astrologer" element={
                <PrivateRoute>
                  <RoleRoute role="astrologer">
                    <AstrologerDashboard />
                  </RoleRoute>
                </PrivateRoute>
              } />
              <Route path="/dashboard/student" element={
                <PrivateRoute>
                  <RoleRoute role="student">
                    <StudentDashboard />
                  </RoleRoute>
                </PrivateRoute>
              } />
              <Route path="/dashboard/client" element={
                <PrivateRoute>
                  <RoleRoute role="client">
                    <ClientDashboard />
                  </RoleRoute>
                </PrivateRoute>
              } />
              <Route
                path="*"
                element={
                  <div className="text-center py-8 text-red-500">
                    <h2>404 - Page Not Found</h2>
                    <Link to="/" className="text-blue-400 hover:text-blue-300">
                      Go back to home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </AuthProvider>
        </main>

        <footer className="text-center text-xs text-gray-400 py-6">
          2025 AstroBalendar | Privacy | Terms | Contact
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
