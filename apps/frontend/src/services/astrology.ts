import axios from 'axios';
import { PredictionResult } from '@shared/types/prediction';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface PredictionRequest {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: string;
  longitude: string;
  timeZone: string;
}

export const getAstrologicalPrediction = async (data: PredictionRequest): Promise<PredictionResult> => {
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

/**
 * Fetches Rasi and Navamsa chart data from backend using birth details.
 * @param birthDetails { dateOfBirth, timeOfBirth, locationName, latitude, longitude }
 * @returns { rasi: PlanetPlacement[], navamsa: PlanetPlacement[] }
 */
export type PlanetPlacement = { name: string; house: number; degree?: number; rasi?: string };

export interface ChartDataRequest {
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

export interface ChartDataResponse {
  rasi: PlanetPlacement[];
  navamsa: PlanetPlacement[];
}

export const getChartData = async (
  birthDetails: ChartDataRequest
): Promise<ChartDataResponse> => {
  try {
    // Call the backend API endpoint for computing chart data
    const response = await axios.post(
      `${API_URL}/api/v1/chart-data`,
      birthDetails,
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.data || !response.data.rasi || !response.data.navamsa) {
      throw new Error('Invalid chart data response');
    }
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch chart data');
  }
};
