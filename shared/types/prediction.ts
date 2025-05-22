// Shared prediction types for KP Astrology platform (frontend + backend)
// All cross-app prediction types are defined here for consistency.

export interface HoroscopeInput {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  place: string;
  lagna: string;
  nakshatra: string;
}

export interface PredictionData {
  status?: string;
  message?: string;
  rulingPlanets?: string[];
  dasaBhukti?: Array<{
    period: string;
    lord: string;
    start: string;
    end: string;
  }>;
  sublordTable?: Array<{
    house: string;
    sublord: string;
  }>;
}

export interface Prediction {
  id: string;
  userId: string;
  horoscopeId: string;
  predictionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionResult {
  prediction: PredictionData;
  success: boolean;
  error: string | null;
  predictionId: string;
}
