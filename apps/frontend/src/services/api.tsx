/// <reference lib="dom" />
/// <reference types="node" />
import { getPrediction } from '../../../shared/api/predict.ts'; // Fixed import path for getPrediction
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface PredictionResponse {
  prediction?: string;
  prediction_id?: string;
  error?: string;
  success?: boolean;
  data?: any;
  predictionId?: string;
}

// TODO: Replace 'any' with HoroscopeInput and PredictionResult types once available
export const fetchPrediction = async (formData: any): Promise<any> => {
  try {
    const response = await getPrediction(formData, API_BASE_URL);
    
    if (!response.success) {
      throw new Error(response.error || 'Prediction failed');
    }

    if (!response.prediction) {
      throw new Error('No prediction data received');
    }

    return {
      prediction: response.prediction,
      predictionId: response.predictionId || 'temp-id',
      error: null,
      success: true
    };
  } catch (error) {
    console.error("Prediction error:", error);
    toast.error('Prediction error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
    throw error;
  }
};

