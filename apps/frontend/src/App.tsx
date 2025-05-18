import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider';
import { HoroscopeProvider } from './context/HoroscopeContext';
import { LoadScript } from '@react-google-maps/api';
// Using inline SVG for PlusIcon to avoid dependency issues

import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AstrologerDashboard from './pages/dashboard/AstrologerDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ExportHoroscopeExample from './pages/ExportHoroscopeExample';
import Calendar from "./pages/Calendar";
import LoginPage from "./pages/auth/LoginPage";
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
import PredictionView from './pages/PredictionView';
import DayAnalysisView from './pages/DayAnalysisView';
import TransitView from './pages/TransitView';
import DasaBhuktiView from './pages/DasaBhuktiView';
import PrasannamView from './pages/PrasannamView';
import EditPredictionPage from './pages/EditPredictionPage';
import MyHoroscopes from './pages/horoscope/MyHoroscopes';

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
              <HoroscopeProvider>
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
                  {/* HEADER MENU ROUTES */}
                  <Route path="/horoscope" element={
                    <PrivateRoute>
                      <MyHoroscopes />
                    </PrivateRoute>
                  } />
                  <Route path="/horoscope/new" element={<NewHoroscopePage />} />
                  <Route path="/day-analysis" element={<DayAnalysisView />} />
                  <Route path="/transit" element={<TransitView />} />
                  <Route path="/dasa-bhukti" element={<DasaBhuktiView />} />
                  <Route path="/prasannam" element={<PrasannamView />} />
                  <Route path="/edit-prediction/:id" element={
                    <PrivateRoute>
                      <RoleRoute role="astrologer">
                        <EditPredictionPage />
                      </RoleRoute>
                    </PrivateRoute>
                  } />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* END HEADER MENU ROUTES */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/role-selection" element={<RoleSelection />} />
                  <Route path="/prediction" element={<PredictionPage />} />
                  <Route path="/prediction/:docId" element={<PredictionView />} />
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
                      <div>
                        <Link
                          to="/horoscope"
                          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <svg className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Horoscopes
                        </Link>
                        <Link
                          to="/horoscope/new"
                          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          New Horoscope
                        </Link>
                      </div>
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
              </HoroscopeProvider>
            </AuthProvider>
          </div>
          <footer className="text-center text-xs text-gray-400 py-6">
            2025 AstroBalendar | Privacy | Terms | Contact
          </footer>
        </div>
      </LoadScript>
    </ErrorBoundary>
  );
}

export default App;
