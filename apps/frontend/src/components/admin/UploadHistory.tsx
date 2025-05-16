import React, { useEffect, useState } from 'react';
import { Loader2, FileText, Eye, Repeat, Download } from 'lucide-react';

interface BatchRecord {
  batchId: string;
  uploaded: number;
  failed: number;
  duplicates: number;
  createdBy: string;
  timestamp: string;
  fileType?: string;
}

const columns = [
  { key: 'batchId', label: 'Batch ID' },
  { key: 'uploaded', label: 'Uploaded' },
  { key: 'failed', label: 'Failed' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'actions', label: 'Actions' },
];

const UploadHistory: React.FC = () => {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', astrologer: '', fileType: '' });
  const [recordsModal, setRecordsModal] = useState<{ open: boolean; batchId: string | null }>({ open: false, batchId: null });
  const [records, setRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await (window as any).getFirebaseToken?.();
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.astrologer) params.append('astrologer', filters.astrologer);
      if (filters.fileType) params.append('fileType', filters.fileType);
      const resp = await fetch(`/api/list-uploads.ts?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Failed to fetch upload history');
      const data = await resp.json();
      setBatches(data.batches || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (batchId: string, type: 'csv' | 'json' = 'csv') => {
    setExporting(true);
    try {
      const token = await (window as any).getFirebaseToken?.();
      const resp = await fetch(`/api/batch-records?batchId=${batchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Failed to fetch batch records');
      const data = await resp.json();
      const records = data.records || [];
      if (type === 'json') {
        const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-${batchId}-records.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV
        const header = 'Record ID,Full Name,Date of Birth,Place of Birth,Status,Message\n';
        const rows = records.map((rec: any) => `${rec.recordId},${rec.fullName || ''},${rec.dob || ''},${rec.pob || ''},${rec.status || ''},${rec.message || ''}`).join('\n');
        const csv = header + rows;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-${batchId}-records.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to export records');
    } finally {
      setExporting(false);
    }
  };

  const handleReprocess = async (batchId: string) => {
    setReprocessing(true);
    try {
      const token = await (window as any).getFirebaseToken?.();
      const resp = await fetch(`/api/batch-records?batchId=${batchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Failed to fetch batch records');
      const data = await resp.json();
      const failed = (data.records || []).filter((r: any) => r.status === 'error');
      if (failed.length === 0) {
        alert('No failed records to reprocess.');
        return;
      }
      // POST to reprocess endpoint
      const resp2 = await fetch('/api/reprocess-failed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ batchId, records: failed }),
      });
      if (!resp2.ok) throw new Error('Failed to reprocess records');
      alert('Reprocessing started for failed records.');
    } catch (e: any) {
      alert(e.message || 'Failed to reprocess records');
    } finally {
      setReprocessing(false);
    }
  };

  const handleViewRecords = async (batchId: string) => {
    setRecordsModal({ open: true, batchId });
    setRecordsLoading(true);
    setRecordsError(null);
    setRecords([]);
    try {
      const token = await (window as any).getFirebaseToken?.();
      const resp = await fetch(`/api/batch-records?batchId=${batchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error('Failed to fetch batch records');
      const data = await resp.json();
      setRecords(data.records || []);
    } catch (e: any) {
      setRecordsError(e.message || 'Failed to load records');
    } finally {
      setRecordsLoading(false);
    }
  };

  return (
    <>
      {/* Records Modal */}
      {recordsModal.open && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={() => setRecordsModal({ open: false, batchId: null })}
          onKeyDown={e => { if (e.key === 'Escape') setRecordsModal({ open: false, batchId: null }); }}
        >
          <div
            className="relative bg-white/95 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-8 modal-scroll"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-astro-gold hover:text-red-400 text-2xl font-bold z-10"
              aria-label="Close Batch Records"
              onClick={() => setRecordsModal({ open: false, batchId: null })}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-astro-gold">Batch Records</h3>
            {recordsLoading ? (
              <div className="flex items-center gap-2 text-astro-gold"><Loader2 className="animate-spin w-6 h-6" /> Loading...</div>
            ) : recordsError ? (
              <div className="text-red-500">{recordsError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-astro-gold/20 rounded-lg">
                  <thead>
                    <tr className="bg-astro-gold/10">
                      <th className="px-2 py-1 text-left">Record ID</th>
                      <th className="px-2 py-1 text-left">Full Name</th>
                      <th className="px-2 py-1 text-left">DOB</th>
                      <th className="px-2 py-1 text-left">POB</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-3">No records found.</td></tr>
                    ) : (
                      records.map((rec, idx) => (
                        <tr key={rec.recordId || idx} className={
                          rec.status === 'success' ? 'bg-green-400/10' :
                          rec.status === 'duplicate' ? 'bg-yellow-400/10' :
                          'bg-red-400/10'
                        }>
                          <td className="px-2 py-1 font-mono">{rec.recordId}</td>
                          <td className="px-2 py-1">{rec.fullName}</td>
                          <td className="px-2 py-1">{rec.dob}</td>
                          <td className="px-2 py-1">{rec.pob}</td>
                          <td className="px-2 py-1">
                            {rec.status === 'success' && <span className="text-green-500 font-semibold">Success</span>}
                            {rec.status === 'duplicate' && <span className="text-yellow-500 font-semibold">Duplicate</span>}
                            {rec.status === 'error' && <span className="text-red-500 font-semibold">Error</span>}
                          </td>
                          <td className="px-2 py-1">{rec.message || ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="w-full max-w-5xl mx-auto mt-10 bg-white/10 border border-astro-gold/20 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-astro-gold mb-6 flex items-center gap-2">
          <FileText className="w-7 h-7" /> Upload History
        </h2>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="input input-bordered input-sm" placeholder="From" />
          <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="input input-bordered input-sm" placeholder="To" />
          <input type="text" value={filters.astrologer} onChange={e => setFilters(f => ({ ...f, astrologer: e.target.value }))} className="input input-bordered input-sm" placeholder="Astrologer Name" />
          <input type="text" value={filters.fileType} onChange={e => setFilters(f => ({ ...f, fileType: e.target.value }))} className="input input-bordered input-sm" placeholder="File Type" />
          <button className="btn btn-astro-gold btn-sm" onClick={fetchBatches}>Apply Filters</button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-astro-gold/20 rounded-lg">
            <thead>
              <tr className="bg-astro-gold/10">
                {columns.map(col => (
                  <th key={col.key} className="px-3 py-2 text-left whitespace-nowrap">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} className="text-center py-6"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={columns.length} className="text-center text-red-400 py-6">{error}</td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-6">No upload batches found.</td></tr>
              ) : (
                batches.map(batch => (
                  <tr key={batch.batchId} className="hover:bg-astro-gold/10 transition">
                    <td className="px-3 py-2 font-mono text-xs">{batch.batchId}</td>
                    <td className="px-3 py-2 text-green-400 font-bold">{batch.uploaded}</td>
                    <td className="px-3 py-2 text-red-400 font-bold">{batch.failed}</td>
                    <td className="px-3 py-2 text-yellow-400 font-bold">{batch.duplicates}</td>
                    <td className="px-3 py-2">{batch.createdBy}</td>
                    <td className="px-3 py-2 text-xs">{new Date(batch.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button className="btn btn-xs btn-blue flex gap-1 items-center" title="View Records" onClick={() => handleViewRecords(batch.batchId)}><Eye className="w-4 h-4" />View</button>
                      <button className="btn btn-xs btn-astro-gold flex gap-1 items-center" title="Export Summary" onClick={() => handleExport(batch.batchId)}><Download className="w-4 h-4" />Export</button>
                      <button className="btn btn-xs btn-yellow-400 flex gap-1 items-center" title="Reprocess Failed" onClick={() => handleReprocess(batch.batchId)}><Repeat className="w-4 h-4" />Reprocess</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UploadHistory;
