import React, { useEffect, useState } from 'react';

interface DeployStatus {
  provider: string;
  status: string;
  commit: string;
  url: string;
  live: boolean;
}

const deployments = [
  { provider: 'Netlify', url: 'https://your-netlify-site.netlify.app' },
  { provider: 'Firebase', url: 'https://your-firebase-app.web.app' },
  { provider: 'Render', url: 'https://your-render-app.onrender.com' },
];

const routes = ['/prediction', '/admin/research', '/horoscope-test'];

const DeploymentAuditDashboard: React.FC = () => {
  const [statuses, setStatuses] = useState<DeployStatus[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkDeployments = async () => {
      setChecking(true);
      const results: DeployStatus[] = await Promise.all(
        deployments.map(async (d) => {
          let commit = '';
          let live = true;
          let status = 'OK';
          try {
            // Try to fetch /version or /api/version endpoint for commit SHA
            const versionRes = await fetch(`${d.url}/api/version`);
            if (versionRes.ok) {
              commit = (await versionRes.json()).commit || '';
            }
            // Check if all key routes are live
            for (const route of routes) {
              const r = await fetch(`${d.url}${route}`);
              if (!r.ok) {
                live = false;
                status = `Route ${route} down`;
                break;
              }
            }
          } catch {
            status = 'Unreachable';
            live = false;
          }
          return { ...d, status, commit, url: d.url, live };
        })
      );
      setStatuses(results);
      setChecking(false);
    };
    checkDeployments();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold text-xl mb-4">Deployment Audit Dashboard</h2>
      <button onClick={() => window.location.reload()} className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded">Refresh</button>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Status</th>
            <th>Commit SHA</th>
            <th>URL</th>
            <th>Routes Live</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map((s) => (
            <tr key={s.provider} className={s.live ? '' : 'bg-red-100'}>
              <td>{s.provider}</td>
              <td>{s.status}</td>
              <td>{s.commit || '-'}</td>
              <td><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{s.url}</a></td>
              <td>{s.live ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {checking && <div className="mt-4 text-gray-500">Checking deployments...</div>}
    </div>
  );
};

export default DeploymentAuditDashboard;
