import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-600">user@example.com</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notification Preferences</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                    Email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="push-notifications"
                    name="push-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                    Push notifications
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
