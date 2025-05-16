import React from 'react';
import { sharedTestsDashboardCard, scheduleAiRetraining } from '../../modules/postlaunch/NextStepLaunchEnhancements';

const PostLaunchToolsPage = () => {
  // Example: count of shared tests, in real app wire to Firestore query
  const sharedCount = 5;
  const retrainMsg = scheduleAiRetraining();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Post-Launch Tools</h1>
      {sharedTestsDashboardCard(sharedCount)}
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <div className="font-bold text-blue-800">AI Retraining</div>
        <div className="text-blue-700">{retrainMsg}</div>
      </div>
    </div>
  );
};

export default PostLaunchToolsPage;
