// Firestore feedback signal schema for ML feedback loop
export interface AiFeedbackSignal {
  recordId: string; // Firestore doc ID
  predictionRef: string; // Firestore path to original prediction
  thumbs: 'up' | 'down';
  correction: string;
  confidence: number; // 0-100
  markAsGold: boolean;
  annotatedBy: string; // UID
  timestamp: number; // ms since epoch
  sourceSessionId: string;
  originalPredictionHash: string;
}
