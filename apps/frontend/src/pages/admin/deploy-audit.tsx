import React from 'react';
import DeploymentAuditDashboard from '../../modules/postlaunch/DeploymentAuditDashboard';

const DeployAuditPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Deployment Audit</h1>
    <DeploymentAuditDashboard />
  </div>
);

export default DeployAuditPage;
