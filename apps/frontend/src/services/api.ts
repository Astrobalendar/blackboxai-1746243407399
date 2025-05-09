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
  prediction?: any;
  prediction_id?: string;
  error?: string;
  success?: boolean;
  data?: any;
  predictionId?: string;
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
      let backendError = '';
      try {
        const errJson = await res.json();
        backendError = errJson.detail || JSON.stringify(errJson);
        console.error('Backend error:', backendError);
        toast.error(`Prediction failed: ${backendError}`);
      } catch (err) {
        backendError = 'Unknown backend error';
        toast.error(`Prediction failed: ${res.status}`);
      }
      throw new Error(`API call failed with status: ${res.status} - ${backendError}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Prediction error:", error);
    toast.error('Prediction error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
    throw error;
  }
};

