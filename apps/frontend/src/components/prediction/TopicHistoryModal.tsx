import React from "react";
import { motion } from "framer-motion";

export interface TopicVersion {
  id: string;
  content: string;
  confidence?: number;
  editedBy?: string;
  timestamp: string;
}

interface TopicHistoryModalProps {
  open: boolean;
  onClose: () => void;
  versions: TopicVersion[];
  onRestore: (version: TopicVersion) => void;
}

const TopicHistoryModal: React.FC<TopicHistoryModalProps> = ({ open, onClose, versions, onRestore }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
      >
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close history modal"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🕒 Topic History
        </h2>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {versions.length === 0 ? (
            <div className="text-gray-500 text-center">No history available.</div>
          ) : (
            versions.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-1 shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-indigo-700">{v.timestamp && new Date(v.timestamp).toLocaleString()}</span>
                  <button
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => onRestore(v)}
                    title="Restore this version"
                  >
                    Restore
                  </button>
                </div>
                <div className="text-xs text-gray-700 whitespace-pre-line mb-1">{v.content}</div>
                <div className="flex items-center gap-2 text-xs">
                  {typeof v.confidence === 'number' && (
                    <span className="text-green-700">Confidence: {v.confidence}%</span>
                  )}
                  {v.editedBy && (
                    <span className="italic text-gray-500 ml-auto">By: {v.editedBy}</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TopicHistoryModal;
