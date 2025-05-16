export interface Prediction {
  id: string;
  userId: string;
  horoscopeId: string;
  predictionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionResult {
  prediction: string;
  success: boolean;
  error: string | null;
  predictionId: string;
}
