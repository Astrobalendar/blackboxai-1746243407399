import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileList from '../components/ProfileList';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const ProfileManagement = () => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProfileSelected = (profileId: string) => {
    setSelectedProfile(profileId);
    // You can navigate to a detailed view or show a modal
    console.log('Selected profile:', profileId);
  };

  const handleCreateNew = () => {
    navigate('/profiles/new');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile Management</h2>
          <Button onClick={handleCreateNew}>
            Create New Profile
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow">
          <ProfileList onProfileSelected={handleProfileSelected} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileManagement;
