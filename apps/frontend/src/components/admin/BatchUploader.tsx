import React, { useState } from 'react';
import UploadHistory from './UploadHistory';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
// You will implement these utilities:
// import { parseCSV, parseXLSX, parseJSON, parseZIP } from '../../utils/parsers';
// import { uploadBatchFile, fetchUploadHistory } from '../../api/upload-horoscopes';

const REQUIRED_FIELDS = [
  'fullName', 'dob', 'tob', 'pob', 'gender', 'prediction', 'dasa', 'sublords'
];

const OPTIONAL_FIELDS = [
  'confidence', 'astrologerRef'
];

const SAMPLE_TEMPLATES = [
  { label: 'CSV', url: '/sample-horoscope-batch.csv' },
  { label: 'JSON', url: '/sample-horoscope-batch.json' }
];

const Step = {
  Upload: 0,
  Validate: 1,
  Preview: 2,
  Submit: 3,
};

function BatchUploader() {
  const [step, setStep] = useState(Step.Upload);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>({ errors: [], duplicates: [] });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<any>({ uploaded: 0, failed: 0, skipped: 0 });
  const [previewFirstOnly, setPreviewFirstOnly] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Export summary as CSV or JSON
  const exportSummary = (type: 'csv' | 'json') => {
    if (!summary || !summary.records) return;
    if (type === 'json') {
      const blob = new Blob([JSON.stringify(summary.records, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'upload-summary.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV
      const header = 'Row,Status,Message\n';
      const rows = summary.records.map((rec: any) => `${rec.rowIndex},${rec.status},${rec.message || ''}`).join('\n');
      const csv = header + rows;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'upload-summary.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Fetch upload history on mount
  React.useEffect(() => {
    // fetchUploadHistory().then(setHistory);
  }, []);

  // Handle file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(Step.Validate);
      // Parse and validate here or in a useEffect
    }
  };

  // Upload file to backend
  const handleSubmitUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setSummary({ uploaded: 0, failed: 0, duplicates: 0, records: [] });
    const start = Date.now();
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Optionally add batchLabel or userId if needed
      // formData.append('batchLabel', ...);
      const token = await (window as any).getFirebaseToken?.(); // You must implement this to get the Firebase ID token
      const resp = await fetch('/api/upload-horoscopes', {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Upload failed');
      setSummary({ ...result, duration: ((Date.now() - start) / 1000).toFixed(1) });
      setStep(Step.Submit);
    } catch (e: any) {
      setSummary({ uploaded: 0, failed: 1, duplicates: 0, records: [{ rowIndex: 0, status: 'failed', message: e.message }], duration: ((Date.now() - start) / 1000).toFixed(1) });
      setStep(Step.Submit);
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  // Stepper navigation
  const goToStep = (s: number) => setStep(s);

  // UI rendering for each step
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#191970] via-[#3a185c] to-[#0f172a] flex flex-col items-center justify-center">
      {/* Sticky Top Nav */}
      <nav className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#191970]/80 to-[#3a185c]/80 backdrop-blur-md border-b border-[#2d2b4a] shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <span className="text-2xl font-bold text-astro-gold tracking-tight flex items-center gap-2">
            <span className="mr-2">📊</span> Horoscope AI Ingestion Console
          </span>
          <span className="ml-auto text-xs text-astro-gold/60">Admin &gt; Training Upload</span>
        </div>
      </nav>
      {/* Glassmorphic Panel */}
      <div className="w-full max-w-5xl mt-12 mb-12 rounded-3xl bg-white/10 shadow-2xl border border-[#2d2b4a] backdrop-blur-xl p-0 overflow-hidden">
        {/* Animated Stepper */}
        <div className="flex items-center justify-between px-12 pt-10 pb-6">
          {["Upload File", "Validate", "Preview", "Summary"].map((label, idx) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <motion.div animate={{ boxShadow: step === idx ? '0 0 16px 4px #eab30899' : 'none' }} className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${step === idx ? 'border-astro-gold bg-[#191970]' : 'border-[#2d2b4a] bg-[#28204a]'} text-2xl font-bold text-astro-gold transition-all`}>{idx + 1}</motion.div>
              <span className={`mt-2 text-xs font-medium ${step === idx ? 'text-astro-gold' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>
        <div className="px-12 pb-12">
          {/* Step 1: Upload File */}
          {step === Step.Upload && (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[340px]">
              {/* Drag and Drop Box */}
              <motion.div whileHover={{ scale: 1.03, boxShadow: '0 0 32px 8px #eab30855' }} className="w-full max-w-lg h-48 flex flex-col items-center justify-center border-4 border-dashed border-astro-gold/70 bg-gradient-to-br from-[#191970]/80 to-[#3a185c]/60 rounded-2xl shadow-xl transition-all cursor-pointer relative group">
                <Upload className="w-14 h-14 text-astro-gold animate-pulse mb-2" />
                <span className="text-lg text-astro-gold font-semibold">Drag & Drop or Click to Upload</span>
                <span className="text-xs text-astro-gold/70 mt-1">Accepted: .csv, .xlsx, .json, .zip</span>
                <label htmlFor="batch-upload-input" className="sr-only">Upload Horoscope Batch File</label>
                <input
                  id="batch-upload-input"
                  type="file"
                  accept=".csv,.xlsx,.json,.zip"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={onFileChange}
                  aria-label="Upload Horoscope Batch File"
                />
              </motion.div>
              {/* File Details Card */}
              {file && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-[#191970]/70 border border-astro-gold/40 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                  <FileText className="w-8 h-8 text-astro-gold" />
                  <div className="flex-1">
                    <div className="font-semibold text-astro-gold text-base">{file.name}</div>
                    <div className="text-xs text-astro-gold/70">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <span className="px-2 py-1 bg-astro-gold/20 rounded text-astro-gold text-xs font-semibold uppercase">{file.name.split('.').pop()?.toUpperCase()}</span>
                  <button className="ml-4 text-red-400 hover:text-red-600" onClick={() => setFile(null)} aria-label="Remove file" title="Remove file"><XCircle className="w-6 h-6" /></button>
                </motion.div>
              )}
              {/* Sample Template Download + Schema Pills */}
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex gap-4">
                  {SAMPLE_TEMPLATES.map(tmpl => (
                    <a key={tmpl.label} href={tmpl.url} download className="text-astro-gold underline text-sm hover:text-astro-gold/80 transition">Download {tmpl.label} Template</a>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map(field => (
                    <span key={field} className={`px-3 py-1 rounded-full text-xs font-medium ${REQUIRED_FIELDS.includes(field) ? 'bg-astro-gold/60 text-[#191970]' : 'bg-[#28204a]/60 text-astro-gold/80'} border border-astro-gold/20`}>{field}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Step 2: Validation Accordion */}
          {step === Step.Validate && (
            <div className="flex flex-col gap-8 min-h-[340px] mt-6">
              {/* Accordion: Valid, Missing, Duplicates */}
              <div className="w-full max-w-3xl mx-auto">
                <div className="rounded-lg overflow-hidden border border-astro-gold/40 bg-[#191970]/60">
                  {/* Placeholder, real validation is backend-driven */}
                  <div className="border-b border-astro-gold/20 last:border-b-0">
                    <div className="flex items-center gap-3 px-6 py-4">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-300">Ready to Validate</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <input type="checkbox" id="skip-invalid" className="accent-astro-gold/80 rounded" checked={skipValidation} onChange={e => setSkipValidation(e.target.checked)} />
                <label htmlFor="skip-invalid" className="text-sm text-astro-gold/80">Skip all invalid rows</label>
              </div>
              <button className="btn btn-astro-gold w-48 mx-auto mt-6" onClick={handleSubmitUpload} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin w-4 h-4 inline-block mr-2" /> : null}
                Continue
              </button>
            </div>
          )}
          {/* Step 3: Spreadsheet Preview & Summary */}
          {step === Step.Preview && (
            <div className="flex flex-col items-center gap-6">
              {/* TODO: Spreadsheet preview, row errors, duplicate indicators */}
              <button
                className="btn btn-blue mt-4"
                onClick={handleSubmitUpload}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Upload className="w-5 h-5 mr-2" />} Continue Upload
              </button>
            </div>
          )}
          {/* Step 4: Upload Summary */}
          {step === Step.Submit && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="flex flex-col items-center justify-center gap-8"
            >
              {/* Confetti and checkmark animation if all rows succeeded */}
              {summary.failed === 0 && summary.duplicates === 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mb-2 animate-bounce" />
                  {/* Placeholder for confetti animation */}
                  <span className="text-2xl font-bold text-green-400">All rows successfully uploaded!</span>
                </motion.div>
              )}
              {/* Overview Panel */}
              <div className="w-full max-w-2xl bg-white/10 border border-astro-gold/30 rounded-xl p-6 flex flex-col gap-4">
                <div className="flex gap-6 items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-semibold text-astro-gold">Uploaded: <span className="text-green-400">{summary.uploaded}</span></span>
                    <span className="text-base text-yellow-400">Duplicates: {summary.duplicates ?? summary.duplicate ?? 0}</span>
                    <span className="text-base text-red-400">Failed: {summary.failed}</span>
                  </div>
                  <div className="text-xs text-astro-gold/70">Duration: ~{summary.duration}s</div>
                </div>
                {/* Detailed Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full text-xs border border-astro-gold/20 rounded-lg">
                    <thead>
                      <tr className="bg-astro-gold/10">
                        <th className="px-2 py-1 text-left">Row</th>
                        <th className="px-2 py-1 text-left">Status</th>
                        <th className="px-2 py-1 text-left">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.records && summary.records.length > 0 ? (
                        summary.records.map((rec: any, idx: number) => (
                          <tr key={idx} className={
                            rec.status === 'success' ? 'bg-green-400/10' :
                            rec.status === 'duplicate' ? 'bg-yellow-400/10' :
                            'bg-red-400/10'
                          }>
                            <td className="px-2 py-1">{rec.rowIndex}</td>
                            <td className="px-2 py-1">
                              {rec.status === 'success' && <span className="text-green-500 font-semibold">Success</span>}
                              {rec.status === 'duplicate' && <span className="text-yellow-500 font-semibold">Duplicate</span>}
                              {rec.status === 'error' && <span className="text-red-500 font-semibold">Error</span>}
                            </td>
                            <td className="px-2 py-1">{rec.message || ''}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="text-center py-2">No records</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Export/History Buttons */}
                <div className="flex gap-4 mt-6">
                  <button className="btn btn-astro-gold" onClick={() => exportSummary('csv')}>Export Summary CSV</button>
                  <button className="btn btn-astro-gold" onClick={() => exportSummary('json')}>Export Summary JSON</button>
                  <button className="btn btn-astro-gold" onClick={() => setShowHistory(true)}>View Upload History</button>
                </div>
              </div>
            </motion.div>
            {/* File Details Card */}
            {file && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-[#191970]/70 border border-astro-gold/40 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                <FileText className="w-8 h-8 text-astro-gold" />
                <div className="flex-1">
                  <div className="font-semibold text-astro-gold text-base">{file.name}</div>
                  <div className="text-xs text-astro-gold/70">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <span className="px-2 py-1 bg-astro-gold/20 rounded text-astro-gold text-xs font-semibold uppercase">{file.name.split('.').pop()?.toUpperCase()}</span>
                <button className="ml-4 text-red-400 hover:text-red-600" onClick={() => setFile(null)} aria-label="Remove file" title="Remove file"><XCircle className="w-6 h-6" /></button>
              </motion.div>
            )}
            {/* Sample Template Download + Schema Pills */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="flex gap-4">
                {SAMPLE_TEMPLATES.map(tmpl => (
                  <a key={tmpl.label} href={tmpl.url} download className="text-astro-gold underline text-sm hover:text-astro-gold/80 transition">Download {tmpl.label} Template</a>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map(field => (
                  <span key={field} className={`px-3 py-1 rounded-full text-xs font-medium ${REQUIRED_FIELDS.includes(field) ? 'bg-astro-gold/60 text-[#191970]' : 'bg-[#28204a]/60 text-astro-gold/80'} border border-astro-gold/20`}>{field}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Validation Accordion */}
        {step === Step.Validate && (
          <div className="flex flex-col gap-8 min-h-[340px] mt-6">
            {/* Accordion: Valid, Missing, Duplicates */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="rounded-lg overflow-hidden border border-astro-gold/40 bg-[#191970]/60">
                {/* Placeholder, real validation is backend-driven */}
                <div className="border-b border-astro-gold/20 last:border-b-0">
                  <div className="flex items-center gap-3 px-6 py-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-300">Ready to Validate</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <input type="checkbox" id="skip-invalid" className="accent-astro-gold/80 rounded" checked={skipValidation} onChange={e => setSkipValidation(e.target.checked)} />
              <label htmlFor="skip-invalid" className="text-sm text-astro-gold/80">Skip all invalid rows</label>
            </div>
            <button className="btn btn-astro-gold w-48 mx-auto mt-6" onClick={handleSubmitUpload} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin w-4 h-4 inline-block mr-2" /> : null}
              Continue
            </button>
          </div>
        )}
        {/* Step 3: Spreadsheet Preview & Summary */}
        {step === Step.Preview && (
          <div className="flex flex-col items-center gap-6">
            {/* TODO: Spreadsheet preview, row errors, duplicate indicators */}
            <button
              className="btn btn-blue mt-4"
              onClick={handleSubmitUpload}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Upload className="w-5 h-5 mr-2" />} Continue Upload
            </button>
          </div>
        )}
        {/* Step 4: Upload Summary */}
        {step === Step.Submit && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="flex flex-col items-center justify-center gap-8"
          >
            {/* Confetti and checkmark animation if all rows succeeded */}
            {summary.failed === 0 && summary.duplicates === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mb-2 animate-bounce" />
                {/* Placeholder for confetti animation */}
                <span className="text-2xl font-bold text-green-400">All rows successfully uploaded!</span>
              </motion.div>
            )}
            {/* Overview Panel */}
            <div className="w-full max-w-2xl bg-white/10 border border-astro-gold/30 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex gap-6 items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold text-astro-gold">Uploaded: <span className="text-green-400">{summary.uploaded}</span></span>
                  <span className="text-base text-yellow-400">Duplicates: {summary.duplicates ?? summary.duplicate ?? 0}</span>
                  <span className="text-base text-red-400">Failed: {summary.failed}</span>
                </div>
                <div className="text-xs text-astro-gold/70">Duration: ~{summary.duration}s</div>
              </div>
              {/* Detailed Table */}
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-xs border border-astro-gold/20 rounded-lg">
                  <thead>
                    <tr className="bg-astro-gold/10">
                      <th className="px-2 py-1 text-left">Row</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.records && summary.records.length > 0 ? (
                      summary.records.map((rec: any, idx: number) => (
                        <tr key={idx} className={
                          rec.status === 'success' ? 'bg-green-400/10' :
                          rec.status === 'duplicate' ? 'bg-yellow-400/10' :
                          'bg-red-400/10'
                        }>
                          <td className="px-2 py-1">{rec.rowIndex}</td>
                          <td className="px-2 py-1">
                            {rec.status === 'success' && <span className="text-green-500 font-semibold">Success</span>}
                            {rec.status === 'duplicate' && <span className="text-yellow-500 font-semibold">Duplicate</span>}
                            {rec.status === 'error' && <span className="text-red-500 font-semibold">Error</span>}
                          </td>
                          <td className="px-2 py-1">{rec.message || ''}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="text-center py-2">No records</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Export/History Buttons */}
              <div className="flex gap-4 mt-6">
                <button className="btn btn-astro-gold" onClick={() => exportSummary('csv')}>Export Summary CSV</button>
                <button className="btn btn-astro-gold" onClick={() => exportSummary('json')}>Export Summary JSON</button>
                <button className="btn btn-astro-gold" onClick={() => setShowHistory(true)}>View Upload History</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    {/* Confetti (optional) */}
    {step === Step.Submit && (
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Placeholder for confetti animation */}
      </div>
    )}
    {/* Upload History Modal */}
    {showHistory && (
      <UploadHistory onClose={() => setShowHistory(false)} />
    )}
  </div>
);

export default BatchUploader;
