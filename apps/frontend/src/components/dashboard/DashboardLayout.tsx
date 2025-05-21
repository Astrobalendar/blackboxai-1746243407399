import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarMenu from '../SidebarMenu';
import HeaderNav from '../HeaderNav';
import { Toaster } from '../ui/toaster';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarMenu />
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <HeaderNav user={user} />
        
        {/* Main content area */}
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
