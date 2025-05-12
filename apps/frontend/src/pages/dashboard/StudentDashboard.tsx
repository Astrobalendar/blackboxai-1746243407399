import React from 'react';

import { useRequireBirthData } from '../../components/useRequireBirthData';

const StudentDashboard: React.FC = () => {
  const { checking } = useRequireBirthData();
  if (checking) return null;
  return (
    <div>
      <h2>Student Dashboard</h2>
      <ul>
        <li>Astro Learning: curated video lessons</li>
        <li>Certification progress</li>
        <li>Ask-Astrologer Q&A section</li>
      </ul>
    </div>
  );
};

export default StudentDashboard;
