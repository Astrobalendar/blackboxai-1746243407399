import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface RoleRouteProps {
  role: string;
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ role, children }) => {
  const { user, userRole, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || userRole !== role) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default RoleRoute;
