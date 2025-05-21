import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PrivateRoute from '../components/PrivateRoute';
import { useAuth } from '../contexts/AuthContext';

// Lazy load page components
const Home = lazy(() => import('../pages/Home'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const HoroscopeGenerator = lazy(() => import('../components/HoroscopeGenerator'));
const PredictionHistory = lazy(() => import('../pages/PredictionHistory'));
const ProfileManagement = lazy(() => import('../pages/ProfileManagement'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const Settings = lazy(() => import('../pages/Settings'));
const KPAstrologyPage = lazy(() => import('../pages/KPAstrologyPage'));

// Fallback component for lazy loading
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Wrapper for protected routes
const ProtectedLayout = () => {
  return (
    <PrivateRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </PrivateRoute>
  );
};

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth">
          <Route path="login" element={user ? <Navigate to="/dashboard" replace /> : <div>Login Page</div>} />
          <Route path="register" element={user ? <Navigate to="/dashboard" replace /> : <div>Register Page</div>} />
          <Route path="forgot-password" element={<div>Forgot Password</div>} />
        </Route>
        
        {/* Protected routes with layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/horoscope" element={<HoroscopeGenerator />} />
          <Route path="/predictions" element={<PredictionHistory />} />
          <Route path="/profiles" element={<ProfileManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/kp-astrology" element={<KPAstrologyPage />} />
        </Route>
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
