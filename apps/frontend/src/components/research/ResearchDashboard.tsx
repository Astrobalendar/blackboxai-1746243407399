import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import FeedbackTable from './FeedbackTable';

const confidenceByTopic = [
  { topic: 'Career', confidence: 0.92 },
  { topic: 'Health', confidence: 0.67 },
  { topic: 'Relationships', confidence: 0.81 },
];

const astrologerVsAIMatch = [
  { name: 'A. Patel', match: 95 },
  { name: 'B. Singh', match: 89 },
  { name: 'C. Rao', match: 78 },
];

const feedbackDist = [
  { name: 'Thumbs Up', value: 1, color: '#22c55e' },
  { name: 'Thumbs Down', value: 1, color: '#ef4444' },
  { name: 'Unreviewed', value: 1, color: '#fbbf24' },
];

const errorTags = [
  { tag: 'health', count: 1 },
  { tag: 'career', count: 1 },
  { tag: 'error', count: 1 },
];

const topics = ['Career', 'Health', 'Relationships'];
const astrologers = ['A. Patel', 'B. Singh', 'C. Rao'];

export default function ResearchDashboard() {
  // Filter state
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedAstrologer, setSelectedAstrologer] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // TODO: Replace with real auth token from context or props
  const token = '';

  const handleExport = async (format: 'csv' | 'json') => {
    setExportLoading(true);
    setExportError(null);
    setExportOpen(false);
    try {
      const params = new URLSearchParams();
      if (selectedTopic) params.append('topic', selectedTopic);
      if (selectedAstrologer) params.append('astrologer', selectedAstrologer);
      if (minConfidence > 0) params.append('minConfidence', String(minConfidence));
      params.append('format', format);
      const res = await fetch(`/api/research/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'astro_research_export.csv' : 'astro_research_export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setExportError('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181028] flex flex-col">
      <header className="px-8 py-6 border-b border-astro-gold/30 flex items-center justify-between bg-[#1d1533]">
        <h1 className="text-3xl font-bold text-astro-gold">Astro Research Lab</h1>
        <div className="relative">
          <button
            className="btn btn-astro-gold"
            onClick={() => setExportOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={exportOpen}
          >
            Export Data
          </button>
          {exportOpen && (
            <ul className="absolute right-0 mt-2 w-40 bg-[#1d1533] border border-astro-gold/20 rounded shadow z-10" role="listbox">
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-astro-gold/10" onClick={() => handleExport('csv')}>Export as CSV</button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-astro-gold/10" onClick={() => handleExport('json')}>Export as JSON</button>
              </li>
            </ul>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <aside className="w-64 bg-[#1d1533] border-r border-astro-gold/20 p-6 flex flex-col gap-6">
          <div>
            <label className="block text-astro-gold mb-1">Topic</label>
            <select className="w-full rounded p-2 bg-[#181028] text-astro-gold" value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
              <option value="">All</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-astro-gold mb-1">Astrologer</label>
            <select className="w-full rounded p-2 bg-[#181028] text-astro-gold" value={selectedAstrologer} onChange={e => setSelectedAstrologer(e.target.value)}>
              <option value="">All</option>
              {astrologers.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-astro-gold mb-1">Min Confidence</label>
            <input type="range" min="0" max="1" step="0.01" value={minConfidence} onChange={e => setMinConfidence(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-astro-gold/70 mt-1">{minConfidence}</div>
          </div>
        </aside>
        {/* Main Dashboard */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Bar: Confidence by Topic */}
            <div className="bg-[#1d1533] rounded-xl p-6 shadow border border-astro-gold/10">
              <h2 className="text-xl font-semibold text-astro-gold mb-4">Confidence by Topic</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={confidenceByTopic}>
                  <XAxis dataKey="topic" stroke="#fbbf24" />
                  <YAxis domain={[0, 1]} tickFormatter={v => v * 100 + '%'} stroke="#fbbf24" />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Line: Astrologer vs AI Match % */}
            <div className="bg-[#1d1533] rounded-xl p-6 shadow border border-astro-gold/10">
              <h2 className="text-xl font-semibold text-astro-gold mb-4">Astrologer vs AI Prediction Match %</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={astrologerVsAIMatch}>
                  <XAxis dataKey="name" stroke="#fbbf24" />
                  <YAxis domain={[0, 100]} tickFormatter={v => v + '%'} stroke="#fbbf24" />
                  <Tooltip />
                  <Line type="monotone" dataKey="match" stroke="#38bdf8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Pie: Feedback Distribution */}
            <div className="bg-[#1d1533] rounded-xl p-6 shadow border border-astro-gold/10">
              <h2 className="text-xl font-semibold text-astro-gold mb-4">Feedback Distribution</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={feedbackDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                    {feedbackDist.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Table: Error/Correction Tags */}
            <div className="bg-[#1d1533] rounded-xl p-6 shadow border border-astro-gold/10 overflow-x-auto">
              <h2 className="text-xl font-semibold text-astro-gold mb-4">Error Types / Correction Tags</h2>
              <table className="min-w-full text-xs border border-astro-gold/20 rounded-lg">
                <thead>
                  <tr className="bg-astro-gold/10">
                    <th className="px-2 py-1 text-left">Tag</th>
                    <th className="px-2 py-1 text-left">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {errorTags.map(tag => (
                    <tr key={tag.tag}>
                      <td className="px-2 py-1">{tag.tag}</td>
                      <td className="px-2 py-1">{tag.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Feedback Table */}
          <div className="bg-[#1d1533] rounded-xl p-6 shadow border border-astro-gold/10 mb-8 overflow-x-auto">
            <h2 className="text-xl font-semibold text-astro-gold mb-4">Prediction Feedback</h2>
            <FeedbackTable filters={{
              topic: selectedTopic,
              astrologer: selectedAstrologer,
              minConfidence: minConfidence > 0 ? minConfidence : undefined,
            }} />
          </div>
        </main>
      </div>
    </div>
  );
}
