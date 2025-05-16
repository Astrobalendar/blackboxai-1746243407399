import React, { useState } from 'react';
import { generateQaReport } from '../../modules/postlaunch/QaReportGenerator';

const QaReportPage = () => {
  const [downloading, setDownloading] = useState(false);
  const fullName = 'Astrologer'; // TODO: wire to auth context or admin
  const timestamp = new Date().toLocaleString();

  const handleDownload = () => {
    setDownloading(true);
    const doc = generateQaReport({ fullName, timestamp });
    doc.save('QA_REPORT.pdf');
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QA Report Generator</h1>
      <button className="bg-indigo-600 text-white px-6 py-2 rounded" onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Generating...' : 'Download QA Report PDF'}
      </button>
    </div>
  );
};

export default QaReportPage;
