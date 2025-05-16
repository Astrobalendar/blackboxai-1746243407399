import React, { useState } from 'react';
import AIChatAssistant from '../prediction/AIChatAssistant';

interface ChartInsightPanelProps {
  chartJson: any;
  userRole: 'astrologer' | 'client';
}

const ChartInsightPanel: React.FC<ChartInsightPanelProps> = ({ chartJson, userRole }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chart-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartJson, userRole }),
      });
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 rounded-xl shadow p-6 mb-4 animate-fade-in">
      {/* AI Chat Assistant for Chart View */}
      <div className="mb-6 flex justify-end">
        <AIChatAssistant
          sessionId={`chart-${chartJson?.id || 'unknown'}-${userRole}`}
          user={{ uid: 'unknown', role: userRole }}
          chartContext={chartJson}
        />
      </div>
      <div className="flex items-center gap-4 mb-2">
        <span className="font-bold text-lg">Chart Insights</span>
        <button
          className="ml-auto px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
          onClick={fetchInsights}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Generate Insights'}
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {insights.length > 0 && (
        <ul className="list-disc pl-6 space-y-1">
          {insights.map((insight, idx) => (
            <li key={idx} className="animate-slide-in-up">{insight}</li>
          ))}
        </ul>
      )}
      {insights.length === 0 && !loading && !error && (
        <div className="text-gray-400 italic">No insights yet. Click the button above.</div>
      )}
      {/* Optionally: Export/copy controls */}
      {insights.length > 0 && (
        <div className="mt-4 flex gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
            onClick={() => navigator.clipboard.writeText(insights.join('\n'))}
          >Copy to Clipboard</button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
            onClick={() => window.print()}
          >Export to PDF</button>
        </div>
      )}
      {/* ML Feedback: Was this helpful? */}
      <InsightFeedbackForm
        userRole={userRole}
        sessionId={window.astrobalendarSessionId || ''}
        onSuccess={() => {}}
      />
    </div>
  );
};

// --- InsightFeedbackForm ---
import { useRef, useState } from 'react';
interface InsightFeedbackFormProps {
  userRole: string;
  sessionId: string;
  onSuccess: () => void;
}
const InsightFeedbackForm: React.FC<InsightFeedbackFormProps> = ({ userRole, sessionId, onSuccess }) => {
  const [thumbs, setThumbs] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditable = userRole === 'astrologer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const recordId = `insight_${sessionId}_${Date.now()}`;
      const res = await fetch('/api/aiFeedbackSignals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          topicKey: 'Insight',
          feedbackNote: comment,
          confidence: 0,
          correction: '',
          thumbs,
          markAsGold: false,
          uid: window.astrobalendarUserId || '',
          sourceSessionId: sessionId,
          originalPredictionHash: '',
        }),
      });
      if (res.ok) {
        setSuccess(true);
        onSuccess();
        setTimeout(() => setSuccess(false), 2000);
        if (formRef.current) formRef.current.reset();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
      }
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} className="border rounded p-2 bg-gray-50 mt-4" onSubmit={handleSubmit}>
      <div className="flex gap-4 items-center mb-2">
        <span className="font-semibold text-xs">Was this helpful?</span>
        <button type="button" className={`px-2 py-1 rounded ${thumbs==='up' ? 'bg-green-200' : 'bg-gray-200'}`} disabled={!isEditable || submitting} onClick={()=>setThumbs('up')}>👍</button>
        <button type="button" className={`px-2 py-1 rounded ${thumbs==='down' ? 'bg-red-200' : 'bg-gray-200'}`} disabled={!isEditable || submitting} onClick={()=>setThumbs('down')}>👎</button>
      </div>
      <textarea
        className="w-full border rounded p-1 text-xs mb-2"
        rows={2}
        disabled={!isEditable || submitting}
        placeholder="Additional feedback (optional)"
        value={comment}
        onChange={e=>setComment(e.target.value)}
      />
      <div className="flex gap-2 items-center">
        <button type="submit" className="btn btn-primary btn-xs" disabled={!isEditable || submitting || !thumbs}>{submitting ? 'Submitting...' : 'Submit'}</button>
        {success && <span className="text-green-600 text-xs">Submitted!</span>}
        {error && <span className="text-red-600 text-xs">{error}</span>}
      </div>
    </form>
  );
};

export default ChartInsightPanel;
