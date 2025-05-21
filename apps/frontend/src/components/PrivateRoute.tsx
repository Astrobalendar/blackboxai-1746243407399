import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from './ui/Loader';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Optional: For role-based access control
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Optional: Role-based access control
  // if (roles && roles.length > 0 && !roles.some(role => user.roles?.includes(role))) {
  //   return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  // }


  return <>{children}</>;
};

export default PrivateRoute;
