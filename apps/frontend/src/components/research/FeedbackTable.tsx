import React, { useState } from 'react';
import useSWR from 'swr';

export interface FeedbackRecord {
  id: string;
  batchId: string;
  fullName: string;
  dob: string;
  topic: string;
  astrologer: string;
  confidence: number;
  aiPrediction: string;
  feedbackNote?: string;
  correction?: string;
  thumbs?: 'up' | 'down';
  markAsGold?: boolean;
  tags?: string[];
  lastReviewedBy?: string;
  reviewedAt?: string;
}

interface FeedbackTableProps {
  filters: Record<string, string | number | undefined>;
}

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export default function FeedbackTable({ filters }: FeedbackTableProps) {
  const [token, setToken] = useState(''); // TODO: Get from auth context
  const query = Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`).join('&');
  const { data, mutate, isLoading } = useSWR(token ? [`/api/research/records?${query}`, token] : null, fetcher);
  const [editing, setEditing] = useState<{ id: string; field: string; value: any } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleEdit = (id: string, batchId: string, field: string, value: any) => {
    setSaving(true);
    setError(null);
    fetch('/api/research/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recordId: id, batchId, field, value }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          mutate();
          setEditing(null);
        } else {
          setError(result.error || 'Error saving');
        }
      })
      .catch(() => setError('Error saving'))
      .finally(() => setSaving(false));
  };

  if (!token) return <div className="text-astro-gold">Please sign in to view feedback records.</div>;
  if (isLoading) return <div className="text-astro-gold">Loading…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const records: FeedbackRecord[] = data?.records || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border border-astro-gold/20 rounded-lg">
        <thead>
          <tr className="bg-astro-gold/10">
            <th className="px-2 py-1">Full Name</th>
            <th className="px-2 py-1">DOB</th>
            <th className="px-2 py-1">Topic</th>
            <th className="px-2 py-1">Astrologer</th>
            <th className="px-2 py-1">Confidence</th>
            <th className="px-2 py-1">Prediction</th>
            <th className="px-2 py-1">Thumbs</th>
            <th className="px-2 py-1">Feedback Note</th>
            <th className="px-2 py-1">Correction</th>
            <th className="px-2 py-1">Gold?</th>
            <th className="px-2 py-1">Tags</th>
            <th className="px-2 py-1">Last Reviewed</th>
          </tr>
        </thead>
        <tbody>
          {records.map(rec => (
            <tr key={rec.id}>
              <td className="px-2 py-1">{rec.fullName}</td>
              <td className="px-2 py-1">{rec.dob}</td>
              <td className="px-2 py-1">{rec.topic}</td>
              <td className="px-2 py-1">{rec.astrologer}</td>
              <td className="px-2 py-1">{(rec.confidence * 100).toFixed(1)}%</td>
              <td className="px-2 py-1">{rec.aiPrediction}</td>
              <td className="px-2 py-1">
                <button disabled={saving} className={rec.thumbs === 'up' ? 'text-green-400' : ''} onClick={() => handleEdit(rec.id, rec.batchId, 'thumbs', rec.thumbs === 'up' ? undefined : 'up')}>👍</button>
                <button disabled={saving} className={rec.thumbs === 'down' ? 'text-red-400 ml-1' : 'ml-1'} onClick={() => handleEdit(rec.id, rec.batchId, 'thumbs', rec.thumbs === 'down' ? undefined : 'down')}>👎</button>
              </td>
              <td className="px-2 py-1">
                {editing && editing.id === rec.id && editing.field === 'feedbackNote' ? (
                  <input
                    className="border rounded p-1 text-xs w-32"
                    value={editing.value}
                    onChange={e => setEditing({ ...editing, value: e.target.value })}
                    onBlur={() => handleEdit(rec.id, rec.batchId, 'feedbackNote', editing.value)}
                    disabled={saving}
                    autoFocus
                  />
                ) : (
                  <span onClick={() => setEditing({ id: rec.id, field: 'feedbackNote', value: rec.feedbackNote || '' })} className="cursor-pointer hover:underline">
                    {rec.feedbackNote || <span className="text-astro-gold/40">Add note</span>}
                  </span>
                )}
              </td>
              <td className="px-2 py-1">
                {editing && editing.id === rec.id && editing.field === 'correction' ? (
                  <input
                    className="border rounded p-1 text-xs w-32"
                    value={editing.value}
                    onChange={e => setEditing({ ...editing, value: e.target.value })}
                    onBlur={() => handleEdit(rec.id, rec.batchId, 'correction', editing.value)}
                    disabled={saving}
                    autoFocus
                  />
                ) : (
                  <span onClick={() => setEditing({ id: rec.id, field: 'correction', value: rec.correction || '' })} className="cursor-pointer hover:underline">
                    {rec.correction || <span className="text-astro-gold/40">Add</span>}
                  </span>
                )}
              </td>
              <td className="px-2 py-1">
                <button disabled={saving} className={rec.markAsGold ? 'text-astro-gold' : ''} onClick={() => handleEdit(rec.id, rec.batchId, 'markAsGold', !rec.markAsGold)}>
                  ★
                </button>
              </td>
              <td className="px-2 py-1">{rec.tags?.join(', ')}</td>
              <td className="px-2 py-1">{rec.reviewedAt ? new Date(rec.reviewedAt).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
