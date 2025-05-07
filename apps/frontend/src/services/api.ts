import { createErrorNotification } from '../components/notifications';

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
    createErrorNotification({
      title: "Prediction Error",
      message: "Failed to fetch prediction",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    });
    throw error;
  }
};
