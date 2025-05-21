import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRoutes } from './router/Routes';
import { AuthProvider } from './contexts/AuthContext';

// Global loading component
const GlobalLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading Astrobalendar...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <ToastContainer 
              position="top-right" 
              autoClose={5000} 
              hideProgressBar={false} 
              closeOnClick
              pauseOnHover
            />
            <Suspense fallback={<GlobalLoader />}>
              <AppRoutes />
            </Suspense>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
