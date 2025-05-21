import { useState } from 'react';
// Using relative path to avoid module resolution issues
const apiClient = {
  post: async (url: string, data: any) => {
    // In a real app, this would make an actual API call
    console.log('API call to:', url, data);
    return { data: null };
  }
};

export type KPChartData = {
  planets: Array<{
    name: string;
    sign: number;
    degree: number;
    nakshatra: string;
    nakshatraLord: string;
    subLord: string;
  }>;
  houses: number[];
  ascendant: number;
  moonSign: number;
  sunSign: number;
};

type ChartData = {
  name: string;
  birthDate: Date;
  latitude: number;
  longitude: number;
};

export function useKPChart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChart = async (data: ChartData) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call here
      // const response = await apiClient.post('/api/kp/chart', {
      //   name: data.name,
      //   birthDate: data.birthDate.toISOString(),
      //   latitude: data.latitude,
      //   longitude: data.longitude,
      // });
      
      // For now, return a resolved promise with mock data
      return new Promise<KPChartData>((resolve) => {
        setTimeout(() => {
          resolve({
            planets: [
              { name: 'Sun', sign: 0, degree: 10, nakshatra: 'Aswini', nakshatraLord: 'Ketu', subLord: 'Mars' },
              { name: 'Moon', sign: 2, degree: 15, nakshatra: 'Mrigashira', nakshatraLord: 'Mars', subLord: 'Mars' },
              { name: 'Mars', sign: 1, degree: 20, nakshatra: 'Bharani', nakshatraLord: 'Venus', subLord: 'Venus' },
              { name: 'Mercury', sign: 11, degree: 25, nakshatra: 'Uttara', nakshatraLord: 'Sun', subLord: 'Sun' },
              { name: 'Jupiter', sign: 9, degree: 5, nakshatra: 'Purva', nakshatraLord: 'Venus', subLord: 'Saturn' },
              { name: 'Venus', sign: 10, degree: 18, nakshatra: 'Hasta', nakshatraLord: 'Moon', subLord: 'Mercury' },
              { name: 'Saturn', sign: 7, degree: 22, nakshatra: 'Uttara', nakshatraLord: 'Sun', subLord: 'Mars' },
              { name: 'Rahu', sign: 5, degree: 12, nakshatra: 'Mrigashira', nakshatraLord: 'Mars', subLord: 'Jupiter' },
              { name: 'Ketu', sign: 11, degree: 12, nakshatra: 'Mrigashira', nakshatraLord: 'Mars', subLord: 'Jupiter' },
            ],
            houses: Array(12).fill(0).map((_, i) => i * 30),
            ascendant: 0,
            moonSign: 2,
            sunSign: 0,
          });
        }, 1000);
      });
    } catch (err: any) {
      console.error('Error generating KP chart:', err);
      setError(err.response?.data?.message || 'Failed to generate chart. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateChart,
    loading,
    error,
  };
};

export default useKPChart;
