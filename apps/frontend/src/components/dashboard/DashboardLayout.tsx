import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import DashboardTopNav from './DashboardTopNav';
import ResearchStatCard from './ResearchStatCard';
import { BarChart } from 'lucide-react';
import useTodayFeedbackCount from './useTodayFeedbackCount';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    if (user) {
      user.getIdToken().then(t => { if (isMounted) setToken(t); });
    } else {
      setToken(null);
    }
    return () => { isMounted = false; };
  }, [user]);

  const { count, isLoading } = useTodayFeedbackCount(token || '');

  return (
    <>
      {/* Unified layout: use only main header */}
      <div className="min-h-screen flex flex-col">
        {/* Astro Research Lab Stat Card */}
        <div className="mb-8 flex flex-wrap gap-6 px-8 pt-6">
          <ResearchStatCard
            title="Feedback Received Today"
            value={isLoading ? '...' : count}
            icon={<BarChart className="w-8 h-8 text-blue-500" />}
            color="border-blue-500"
          />
        </div>
        <main className="flex-1 px-8 pb-8">
          {children}
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
