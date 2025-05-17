export interface PredictionInput {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
}

export interface PredictionResult {
  id?: string;
  prediction?: any;
  success?: boolean;
  error?: string | null;
  predictionId?: string;
}
