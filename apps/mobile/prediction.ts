import { PredictionInput, PredictionResult } from '@shared/types/prediction';
import { getPrediction as sharedGetPrediction } from '@shared/api/predict';
import { API_URL } from '@env';

export async function getPrediction(input: PredictionInput) {
  return sharedGetPrediction(input, API_URL);
}
