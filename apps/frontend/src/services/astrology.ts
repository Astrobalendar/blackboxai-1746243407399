import axios from 'axios';
import { getAuth } from 'firebase/auth';
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
  timeZone?: string;
}

export interface ChartDataResponse {
  rasi: PlanetPlacement[];
  navamsa: PlanetPlacement[];
}

export const getChartData = async (
  birthDetails: ChartDataRequest
): Promise<ChartDataResponse> => {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_URL}/api/v1/chart-data`,
      {
        ...birthDetails,
        timezone: birthDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      {
        timeout: 30000,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    // Handle different response formats
    const responseData = response.data?.data || response.data;
    
    if (!responseData) {
      throw new Error('Empty response from chart data service');
    }
    
    // Handle case where response is { rasi: [...], navamsa: [...] }
    if (responseData.rasi && responseData.navamsa) {
      return {
        rasi: responseData.rasi,
        navamsa: responseData.navamsa
      };
    }
    
    // Handle case where response is { status: 'success', data: { rasi: [...], navamsa: [...] } }
    if (responseData.status === 'success' && responseData.data?.rasi && responseData.data?.navamsa) {
      return {
        rasi: responseData.data.rasi,
        navamsa: responseData.data.navamsa
      };
    }
    
    throw new Error('Invalid chart data response format');
  } catch (error: any) {
    console.error('Error in getChartData:', error);
    
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      
      if (error.response) {
        // Handle HTTP error responses
        switch (error.response.status) {
          case 400:
            throw new Error('Invalid birth data provided');
          case 401:
            throw new Error('Authentication required');
          case 404:
            throw new Error('Chart data service not found. Please contact support.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(error.response.data?.message || 'Failed to fetch chart data');
        }
      }
    }
    
    // Handle other errors
    throw new Error(error.message || 'Failed to fetch chart data');
  }
};
