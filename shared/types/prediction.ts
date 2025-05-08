export interface PredictionInput {
  name: string;
  birthDate: string;
  location: string;
}

export interface PredictionResult {
  summary: string;
  details: Record<string, string>;
}
