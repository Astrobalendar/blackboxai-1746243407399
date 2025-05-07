import axios from 'axios';
import { AstrologicalPrediction } from '../types/astrology';

const API_URL = process.env.REACT_APP_ASTROLOGY_API_URL || 'http://localhost:3001';

interface PredictionRequest {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: string;
  longitude: string;
  timeZone: string;
}

export const getAstrologicalPrediction = async (data: PredictionRequest): Promise<AstrologicalPrediction> => {
  try {
    const response = await axios.post(`${API_URL}/prediction`, data, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    
    if (axiosError.response?.status === 401) {
      throw new Error('Authentication required');
    } else if (axiosError.response?.status === 400) {
      throw new Error('Invalid request data');
    } else if (axiosError.code === 'ECONNABORTED') {
      throw new Error('Request timed out');
    } else if (axiosError.response) {
      throw new Error(`Server error: ${axiosError.response.data?.message || 'Unknown error'}`);
    } else {
      throw new Error('Failed to fetch astrological prediction');
    }
  }
};
