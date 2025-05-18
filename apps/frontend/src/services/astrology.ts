import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { PredictionResult } from '@shared/types/prediction';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

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

    const timezone = birthDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const payload = {
      date: birthDetails.dateOfBirth,
      time: birthDetails.timeOfBirth,
      latitude: birthDetails.latitude,
      longitude: birthDetails.longitude,
      timezone: timezone,
      place: birthDetails.locationName,
      ayanamsa: 'LAHIRI',
      settings: {
        sidereal: true,
        ayanamsa: 'LAHIRI',
        houseSystem: 'PLACIDUS',
        aspectPoints: ['BODYTYPE'],
        aspectWithPoints: ['HOUSE', 'RASHI'],
        aspectTypes: ['MAJOR', 'MINOR', 'CHALIT'],
        language: 'en',
        observation: {
          type: 'geo',
          geo: {
            latitude: birthDetails.latitude,
            longitude: birthDetails.longitude
          }
        }
      }
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending chart data request:', {
        url: `${API_URL}/charts/generate`,
        payload: payload
      });
    }

    const response = await axios.post(
      `${API_URL}/charts/generate`,
      payload,
      {
        timeout: 30000,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      }
    );
    
    // Handle different response formats
    const responseData = response.data?.data || response.data;
    
    if (!responseData) {
      throw new Error('Empty response from chart data service');
    }
    
    // Log the raw response for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Raw chart data response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: responseData
      });
    }
    
    // If we got a successful response but no data, throw a helpful error
    if (!responseData) {
      throw new Error('Received empty response from chart service');
    }

    // Handle different response formats
    let chartData = responseData?.data || responseData;
    
    // Extract rasi and navamsa data from the response
    let rasi = [];
    let navamsa = [];
    
    // Try different response formats
    if (chartData?.chart?.planets) {
      // Format: { chart: { planets: [...] } }
      rasi = chartData.chart.planets;
      if (chartData.navamsa?.planets) {
        navamsa = chartData.navamsa.planets;
      }
    } else if (chartData?.planets) {
      // Direct planets array
      rasi = chartData.planets;
    } else if (chartData?.rasi) {
      // Direct rasi/navamsa format
      rasi = chartData.rasi;
      navamsa = chartData.navamsa || [];
    } else if (responseData?.success === true && responseData.data) {
      // Handle success: true with data format
      chartData = responseData.data;
      rasi = chartData.planets || chartData.rasi || [];
      navamsa = chartData.navamsa || [];
    }
    
    // If we have rasi data but no navamsa, create an empty navamsa array
    if (rasi.length > 0) {
      return { 
        rasi, 
        navamsa: navamsa.length > 0 ? navamsa : [] 
      };
    }
    
    throw new Error('Invalid chart data response format');
  } catch (error: any) {
    console.error('Error in getChartData:', error);
    
    // Log detailed error information for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        } : undefined,
        request: axios.isAxiosError(error) ? {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers,
          params: error.config?.params,
          data: error.config?.data
        } : undefined
      });
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (error.response) {
        // Handle HTTP error responses with more detailed messages
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'Failed to fetch chart data';
        
        switch (error.response.status) {
          case 400:
            throw new Error(`Invalid request: ${errorMessage}`);
          case 401:
            // If we get a 401, the token might be expired - sign out the user
            await getAuth().signOut();
            throw new Error('Your session has expired. Please log in again.');
          case 403:
            throw new Error('You do not have permission to access this resource.');
          case 404:
            throw new Error('The requested chart data could not be found.');
          case 422:
            throw new Error(`Validation error: ${errorMessage}`);
          case 429:
            throw new Error('Too many requests. Please wait before trying again.');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new Error('Our chart service is temporarily unavailable. Please try again in a few minutes.');
          default:
            throw new Error(`An error occurred: ${errorMessage}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Could not connect to the chart service. Please check your internet connection.');
      }
    }
    
    // Handle non-Axios errors
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle other errors
    throw new Error(error.message || 'Failed to fetch chart data');
  }
};
