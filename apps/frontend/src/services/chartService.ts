import apiClient from '@/lib/apiClient';
import { BirthData, KPChartData } from '@/types/kpAstrology';

/**
 * Service for handling KP Astrology chart generation and management
 */

/**
 * Generate a new KP Astrology chart
 */
export const generateKPChart = async (birthData: BirthData): Promise<KPChartData> => {
  try {
    const response = await apiClient.post<KPChartData>('/horoscope/kp', {
      ...birthData,
      // Ensure coordinates are strings as expected by the backend
      latitude: String(birthData.latitude),
      longitude: String(birthData.longitude),
    });
    
    // Validate response structure
    if (!response.data || !Array.isArray(response.data.planets) || !Array.isArray(response.data.houses)) {
      throw new Error('Invalid chart data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error generating KP chart:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to generate KP chart';
    throw new Error(errorMessage);
  }
};

/**
 * Get a cached KP Astrology chart by ID
 */
export const getCachedKPChart = async (chartId: string): Promise<KPChartData> => {
  try {
    const response = await apiClient.get<KPChartData>(`/horoscope/kp/${chartId}`);
    
    // Validate response structure
    if (!response.data || !Array.isArray(response.data.planets) || !Array.isArray(response.data.houses)) {
      throw new Error('Invalid chart data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cached KP chart:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load KP chart';
    throw new Error(errorMessage);
  }
};

/**
 * Save a chart to user's history
 */
export const saveChartToHistory = async (chartData: { userId: string; chartData: KPChartData; chartName: string; createdAt: string }): Promise<{ id: string }> => {
  try {
    const response = await apiClient.post('/horoscope/kp/save', {
      chartData,
      name,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error saving chart:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save chart';
    throw new Error(errorMessage);
  }
};

/**
 * Get user's saved charts
 */
export const getSavedCharts = async (): Promise<Array<{ id: string; name: string; createdAt: string }>> => {
  try {
    const response = await apiClient.get('/horoscope/kp/saved');
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching saved charts:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load saved charts';
    throw new Error(errorMessage);
  }
};
