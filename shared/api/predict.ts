import axios from 'axios';
import { PredictionInput, PredictionResult } from '../types/prediction';

export const getPrediction = async (
  input: PredictionInput,
  baseURL: string
): Promise<PredictionResult> => {
  const response = await axios.post(`${baseURL}/predict`, input);
  return response.data;
};
