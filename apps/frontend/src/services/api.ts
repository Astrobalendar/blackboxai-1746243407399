import { getPrediction } from '@shared/api/predict';
import { toast } from 'react-toastify';
export { getPrediction };
export * from '@shared/types/prediction';

export interface PredictionRequest {
  birthData: {
    date: string;
    time: string;
    location: string;
  };
  [key: string]: any; // Allow for additional fields
}

export interface PredictionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const fetchPrediction = async (formData: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const res = await fetch("https://astrobalendar-backend.onrender.com/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error(`API call failed with status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Prediction error:", error);
    toast.error('Prediction error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
    throw error;
  }
};

