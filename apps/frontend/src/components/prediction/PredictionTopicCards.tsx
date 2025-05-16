import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../../firebase"; // Adjust import as needed
import TopicHistoryModal, { TopicVersion as BaseTopicVersion } from "./TopicHistoryModal";

type TopicVersion = BaseTopicVersion & { source?: string };
import { logTopicVersion, fetchTopicVersions, restoreTopicVersion } from "./firestoreTopicVersioning";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { BookOpen, Briefcase, Heart, Globe, GraduationCap, Plane, Star, Flower2, Sparkles, FileDown } from "lucide-react";
import { gptSegmentPrediction } from "./gptSegmentPrediction";
import { exportTopicToPDF } from "./pdfExportTopic";

// Topic metadata
const TOPICS = [
  { key: "career", label: "Career", icon: <Briefcase className="w-5 h-5 inline-block mr-1" />, color: "bg-blue-100 text-blue-800" },
  { key: "health", label: "Health", icon: <Heart className="w-5 h-5 inline-block mr-1" />, color: "bg-red-100 text-red-800" },
  { key: "finance", label: "Finance", icon: <Globe className="w-5 h-5 inline-block mr-1" />, color: "bg-green-100 text-green-800" },
  { key: "education", label: "Education", icon: <GraduationCap className="w-5 h-5 inline-block mr-1" />, color: "bg-yellow-100 text-yellow-800" },
  { key: "travel", label: "Travel", icon: <Plane className="w-5 h-5 inline-block mr-1" />, color: "bg-purple-100 text-purple-800" },
  { key: "relationships", label: "Relationships/Marriage", icon: <Heart className="w-5 h-5 inline-block mr-1" />, color: "bg-pink-100 text-pink-800" },
  { key: "spirituality", label: "Spirituality", icon: <Flower2 className="w-5 h-5 inline-block mr-1" />, color: "bg-indigo-100 text-indigo-800" },
];

// Rule-based segmentation (can be upgraded to AI)
function segmentPrediction(rawText: string) {
  const sections: Record<string, string> = {};
  TOPICS.forEach(({ key, label }) => {
    const regex = new RegExp(`(?:^|\n)${label}:(.*?)(?=\n[A-Z][a-zA-Z]+:|$)`, "is");
    const match = rawText.match(regex);
    sections[key] = match ? match[1].trim() : "";
  });
  return sections;
}

interface TopicCardProps {
  topicKey: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  content: string;
  editable: boolean;
  onSave: (content: string) => void;
  confidence?: number;
  confidenceSource?: string;
  rating?: number;
  lastEditedBy?: string;
  fullName: string;
  dob?: string;
  editedBy?: string;
  onConfidenceChange?: (score: number, source: string) => void;
  isAstrologer?: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({ topicKey, label, icon, color, content, editable, onSave, confidence, confidenceSource, rating, lastEditedBy, fullName, dob, editedBy, onConfidenceChange, isAstrologer }) => {
  // --- State and Versioning Logic ---
  const [collapsed, setCollapsed] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [editing, setEditing] = useState(false);
  const [localConfidence, setLocalConfidence] = useState<number | undefined>(confidence);
  const [localSource, setLocalSource] = useState<string | undefined>(confidenceSource);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<TopicVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => { setEditValue(content); }, [content]);
  useEffect(() => { setLocalConfidence(confidence); setLocalSource(confidenceSource); }, [confidence, confidenceSource]);

  // Fetch version history
  const handleOpenHistory = async () => {
    setLoadingHistory(true);
    setHistoryOpen(true);
    try {
      const userId = (window as any).astrobalendarUserId || '';
      const horoscopeId = (window as any).astrobalendarHoroscopeId || '';
      const fetched = await fetchTopicVersions({ userId, horoscopeId, topicKey });
      setVersions(fetched);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Log a new version if changed
  const logVersionIfChanged = async (newContent: string, newConfidence: number | undefined, newSource: string | undefined) => {
    const userId = (window as any).astrobalendarUserId || '';
    const horoscopeId = (window as any).astrobalendarHoroscopeId || '';
    // Only log if content or confidence changed
    if (newContent !== content || newConfidence !== confidence || newSource !== confidenceSource) {
      await logTopicVersion({
        userId,
        horoscopeId,
        topicKey,
        data: {
          content: newContent,
          confidence: newConfidence,
          editedBy: lastEditedBy || fullName,
          timestamp: new Date().toISOString(),
          source: newSource === 'GPT' ? 'AI' : 'Astrologer',
        },
      });
    }
  };

  // Save edit and log version
  const handleSave = async () => {
    setEditing(false);
    if (editValue !== content) {
      await logVersionIfChanged(editValue, localConfidence, localSource);
      onSave(editValue);
    }
  };

  // Save confidence and log version
  const handleConfidenceChange = async (val: number) => {
    setLocalConfidence(val);
    setLocalSource('Astrologer');
    if (onConfidenceChange) onConfidenceChange(val, 'Astrologer');
    await logVersionIfChanged(editValue, val, 'Astrologer');
  };

  // Restore version
  const handleRestore = async (version: TopicVersion) => {
    setRestoring(true);
    const userId = (window as any).astrobalendarUserId || '';
    const horoscopeId = (window as any).astrobalendarHoroscopeId || '';
    // Ensure type safety for Firestore
    const safeSource = version.source === "AI" || version.source === "Astrologer" ? version.source : "Astrologer";
    await restoreTopicVersion({ userId, horoscopeId, topicKey, version: { ...version, source: safeSource } });
    setEditValue(version.content);
    setLocalConfidence(version.confidence);
    setLocalSource(safeSource);
    setRestoring(false);
    setHistoryOpen(false);
    if (onSave) onSave(version.content);
    if (onConfidenceChange && typeof version.confidence === 'number') onConfidenceChange(version.confidence, safeSource);
  };

  // Unique ID for html2canvas export
  const cardId = `topic-card-${topicKey}`;

  // Gradient color for confidence bar
  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-lime-400';
    if (val >= 40) return 'bg-yellow-400';
    if (val >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  

  return (
    <motion.div
      id={cardId}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl shadow-lg p-4 mb-4 glass-card border-l-8 ${color} relative`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          {icon}
          {label}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-gray-500 hover:text-indigo-700"
            aria-label="Export PDF"
            title="Export this topic as PDF"
            onClick={async (e) => {
              e.stopPropagation();
              const now = new Date();
              await exportTopicToPDF({
                cardId,
                topicTitle: label,
                fullName,
                dob,
                editedBy: lastEditedBy,
                iconUrl: undefined, // Optionally provide icon as image
                logoUrl: undefined, // Optionally provide logo
                timestamp: now.toLocaleString(),
              });
            }}
          >
            <FileDown className="w-5 h-5" />
          </button>
          {isAstrologer && (
            <button
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
              aria-label="View topic history"
              title="View and restore history"
              onClick={handleOpenHistory}
            >
              <span role="img" aria-label="history">🕒</span> History
            </button>
          )}
          <button className="text-xs text-gray-400 hover:text-gray-700" aria-label="Collapse/Expand" onClick={() => setCollapsed((c) => !c)}>{collapsed ? "Show" : "Hide"}</button>
        </div>
      </div>
      {!collapsed && (
        <div className="mt-2">
          {/* ML Feedback UI */}
          <FeedbackForm
            topicKey={topicKey}
            user={window.astrobalendarUserId || ''}
            sessionId={window.astrobalendarSessionId || ''}
            isAstrologer={!!isAstrologer}
            onSuccess={() => {
              // Optionally trigger a toast or reload feedback
            }}
          />
          {editable && editing ? (
            <>
              <textarea
                className="w-full border border-yellow-400 rounded p-2 bg-white/60 mb-2"
                rows={3}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder={`Enter ${label} prediction...`}
                title={`Edit ${label} prediction`}
              />
              <button className="btn btn-success mr-2" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setEditValue(content); }}>Cancel</button>
            </>
          ) : (
            <>
              <div className="text-gray-700 whitespace-pre-line mb-2">{content || <span className="italic text-gray-400">No prediction for this topic.</span>}</div>
              {editable && <button className="btn btn-outline btn-xs" onClick={() => setEditing(true)}>Edit</button>}
            </>
          )}

          {/* Confidence scoring UI */}
          <div className="mt-4">
            {(typeof localConfidence === 'number') ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">Confidence</span>
                    {localSource === 'GPT' && <span className="text-xs text-indigo-600 ml-1">✨ AI Confidence</span>}
                    {localSource === 'Astrologer' && <span className="text-xs text-yellow-600 ml-1">✍️ Astrologer</span>}
                  </div>
                  <div className="relative h-3 w-full rounded bg-gray-200">
                    <motion.div
                      className={`absolute left-0 top-0 h-3 rounded ${getBarColor(localConfidence)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${localConfidence}%` }}
                      transition={{ duration: 0.7 }}
                      style={{ minWidth: 8 }}
                    />
                  </div>
                </div>
                <span
                  className="text-xs text-gray-700 cursor-help select-none"
                  title={`${localSource === 'GPT' ? 'AI' : 'Astrologer'} Confidence: ${localConfidence}%`}
                >
                  {localConfidence}%
                </span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">Confidence not available</div>
            )}
            {/* Astrologer can edit if not AI */}
            {isAstrologer && (localSource !== 'GPT') && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min={0}
                max={100}
                value={typeof localConfidence === 'number' ? localConfidence : 50}
                onChange={e => handleConfidenceChange(Number(e.target.value))}
                className="w-32 accent-yellow-500"
                aria-label="Confidence slider"
                title="Set confidence for this topic"
              />
              <span className="text-xs text-gray-500">{localConfidence ?? 50}%</span>
            </div>
          )}

          {/* History Modal */}
          {isAstrologer && historyOpen && (
            <TopicHistoryModal
              open={historyOpen}
              onClose={() => setHistoryOpen(false)}
              versions={versions}
              onRestore={handleRestore}
            />
          )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            
            {typeof rating === "number" && (
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-green-500" /> Rating: {rating}/5</span>
            )}
            {lastEditedBy && <span className="italic text-gray-400 ml-auto">Last edited by {lastEditedBy}</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface PredictionTopicCardsProps {
  rawText: string;
  user: User;
  horoscopeId: string;
  editable: boolean;
}

export const PredictionTopicCards: React.FC<PredictionTopicCardsProps> = ({ rawText, user, horoscopeId, editable }) => {
  const [topics, setTopics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [usedAI, setUsedAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firestore path: users/{uid}/horoscopes/{horoscopeId}/topics/
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);
      try {
        const topicsRef = doc(db, `users/${user.uid}/horoscopes/${horoscopeId}/topics`, 'all');
        const snap = await getDoc(topicsRef);
        if (snap.exists()) {
          setTopics(snap.data());
          setUsedAI(!!snap.data()._segmentedByAI);
        } else {
          // Try GPT segmentation first
          const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (apiKey) {
            const { segmented, usedAI: ai, error: aiErr } = await gptSegmentPrediction(rawText, apiKey);
            if (ai && segmented) {
              setTopics({ ...segmented, _segmentedByAI: true });
              setUsedAI(true);
            } else {
              setTopics(segmentPrediction(rawText));
              setUsedAI(false);
              if (aiErr) setError("AI segmentation failed: " + aiErr);
            }
          } else {
            setTopics(segmentPrediction(rawText));
            setUsedAI(false);
            setError("No OpenAI API key provided. Using fallback.");
          }
        }
      } catch (err: any) {
        setTopics(segmentPrediction(rawText));
        setUsedAI(false);
        setError("Error loading topics. Using fallback.");
      }
      setLoading(false);
    };
    fetchTopics();
  }, [rawText, user.uid, horoscopeId]);

  // Save topic to Firestore
  const saveTopic = async (topicKey: string, content: string) => {
    setTopics((prev) => ({ ...prev, [topicKey]: { ...prev[topicKey], content, lastEditedBy: user.displayName || user.email } }));
    const topicsRef = doc(db, `users/${user.uid}/horoscopes/${horoscopeId}/topics`, 'all');
    await setDoc(topicsRef, { [topicKey]: { ...topics[topicKey], content, lastEditedBy: user.displayName || user.email }, _segmentedByAI: usedAI }, { merge: true });
  };

  // Save confidence to Firestore
  const saveConfidence = async (topicKey: string, confidence: number, source: string) => {
    setTopics((prev) => ({ ...prev, [topicKey]: { ...prev[topicKey], confidence, confidenceSource: source } }));
    const topicsRef = doc(db, `users/${user.uid}/horoscopes/${horoscopeId}/topics`, 'all');
    await setDoc(topicsRef, { [topicKey]: { ...topics[topicKey], confidence, confidenceSource: source }, _segmentedByAI: usedAI }, { merge: true });
  };


  if (loading) return <div className="text-center text-yellow-700">Loading topics...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-2">
      {usedAI && (
        <div className="flex items-center gap-2 mb-2 text-sm text-indigo-700"><Sparkles className="w-4 h-4" />✨ Segmented by AI</div>
      )}
      {error && (
        <div className="text-xs text-red-500 mb-2">{error}</div>
      )}
      {TOPICS.map(({ key, label, icon, color }) => (
        <TopicCard
          key={key}
          topicKey={key}
          label={label}
          icon={icon}
          color={color}
          content={topics[key]?.content || topics[key] || ""}
          editable={editable}
          onSave={(content) => saveTopic(key, content)}
          confidence={topics[key]?.confidence}
          confidenceSource={topics[key]?.confidenceSource}
          rating={topics[key]?.rating}
          lastEditedBy={topics[key]?.lastEditedBy}
          fullName={(user as any).fullName || user.displayName || user.email || "User"}
          dob={(user as any).dob || (user as any).birthDate}
          editedBy={topics[key]?.lastEditedBy}
          onConfidenceChange={(score, source) => saveConfidence(key, score, source)}
          isAstrologer={editable}
        />
      ))}
    </div>
  );
};

// --- FeedbackForm Component ---
import { useRef } from 'react';

interface FeedbackFormProps {
  topicKey: string;
  user: string;
  sessionId: string;
  isAstrologer: boolean;
  onSuccess: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ topicKey, user, sessionId, isAstrologer, onSuccess }) => {
  const [thumbs, setThumbs] = useState<'up' | 'down' | null>(null);
  const [confidence, setConfidence] = useState<number>(50);
  const [correction, setCorrection] = useState('');
  const [markAsGold, setMarkAsGold] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const recordId = `${topicKey}_${user}_${Date.now()}`;
      const res = await fetch('/api/aiFeedbackSignals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          topicKey,
          feedbackNote: '',
          confidence,
          correction,
          thumbs,
          markAsGold,
          uid: user,
          sourceSessionId: sessionId,
          originalPredictionHash: '', // Fill if available
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
    <form ref={formRef} className="border rounded p-2 bg-gray-50 mb-2 mt-2" onSubmit={handleSubmit}>
      <div className="flex gap-4 items-center mb-2">
        <span className="font-semibold text-xs">Feedback:</span>
        <button type="button" className={`px-2 py-1 rounded ${thumbs==='up' ? 'bg-green-200' : 'bg-gray-200'}`} disabled={submitting} onClick={()=>setThumbs('up')}>👍</button>
        <button type="button" className={`px-2 py-1 rounded ${thumbs==='down' ? 'bg-red-200' : 'bg-gray-200'}`} disabled={submitting} onClick={()=>setThumbs('down')}>👎</button>
        <span className="ml-4 text-xs text-gray-500">Confidence:</span>
        <input type="range" min={0} max={100} value={confidence} disabled={submitting} onChange={e=>setConfidence(Number(e.target.value))} className="w-24 accent-yellow-500" />
        <span className="text-xs">{confidence}%</span>
        {isAstrologer && (
          <label className="ml-4 flex items-center gap-1 text-xs">
            <input type="checkbox" checked={markAsGold} disabled={submitting} onChange={e=>setMarkAsGold(e.target.checked)} />
            Mark as Gold
          </label>
        )}
      </div>
      <textarea
        className="w-full border rounded p-1 text-xs mb-2"
        rows={2}
        disabled={submitting}
        placeholder="Correction or feedback (optional)"
        value={correction}
        onChange={e=>setCorrection(e.target.value)}
      />
      <div className="flex gap-2 items-center">
        <button type="submit" className="btn btn-primary btn-xs" disabled={submitting || !thumbs}>{submitting ? 'Submitting...' : 'Submit Feedback'}</button>
        {success && <span className="text-green-600 text-xs">Submitted!</span>}
        {error && <span className="text-red-600 text-xs">{error}</span>}
      </div>
    </form>
  );
};

export default PredictionTopicCards;
