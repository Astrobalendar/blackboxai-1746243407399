import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider';
import { LoadScript } from '@react-google-maps/api';

import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AstrologerDashboard from './pages/dashboard/AstrologerDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ExportHoroscopeExample from './pages/ExportHoroscopeExample';
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import PredictionPage from "./pages/Prediction";
import ChatPage from "./pages/ChatPage";
import NewHoroscopePage from './pages/NewHoroscope';
import TestPrediction from './pages/TestPrediction';
import { fetchPrediction } from "./services/api";
import HeaderNav from "./components/HeaderNav";
import BirthDataEntry from './pages/BirthDataEntry';
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Prediction, PredictionResult } from "./shared/types/prediction";

interface PredictionPageProps {
  prediction: PredictionResult | null;
}

function App() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  return (
    <ErrorBoundary>
      <ToastContainer />
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']}>
        <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-300 text-yellow-900 font-sans flex flex-col">
          <HeaderNav />
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
            <AuthProvider>
              <Routes>
              {/* Modernized: Use /birth-entry as the enforced route for birth data entry */}
<Route path="/birth-entry" element={
  <PrivateRoute>
    <BirthDataEntry />
  </PrivateRoute>
} />
{/* Backward compatibility: Redirect /birthdata to /birth-entry */}
<Route path="/birthdata" element={<Navigate to="/birth-entry" replace />} />
              <Route path="/" element={<Home />} />
<Route path="/export-example" element={<ExportHoroscopeExample />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/prediction" element={<PredictionPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/test-prediction" element={<TestPrediction prediction={{ prediction: 'Test prediction result', success: true, error: null, predictionId: 'test-id' }} />} />
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
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
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
        </div>
        </div>
        <footer className="text-center text-xs text-gray-400 py-6">
          2025 AstroBalendar | Privacy | Terms | Contact
        </footer>
      </LoadScript>
    </ErrorBoundary>
  );
}

export default App;
