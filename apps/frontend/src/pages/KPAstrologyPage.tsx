import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Label from '@/components/ui/label';
import { Loader2, Save, Clock, MapPin, User, Star, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import KPChartSVG from '@/components/charts/KPChartSVG';
import { KPChartData, BirthData } from '@/types/kpAstrology';
import HoroscopeGenerator from '@/components/HoroscopeGenerator';
import { generateKPChart, saveChartToHistory, getSavedCharts } from '@/services/chartService';

// Simple tab interface
type TabType = 'chart' | 'horoscope';

// Tab configuration
const tabs = [
  { id: 'chart', label: 'KP Chart', icon: LayoutDashboard },
  { id: 'horoscope', label: 'Horoscope', icon: Star },
];

// Define form data type that matches our form fields
type FormData = {
  fullName: string;
  birthDate: string;
  birthTime: string;
  latitude: string;
  longitude: string;
  chartName?: string;
  saveChart?: boolean;
  timezone?: string;
  city?: string;
  country?: string;
};

// Default chart data with proper typing
const defaultChartData: KPChartData = {
  planets: [],
  houses: Array(12).fill(0).map((_, i) => ({
    number: i + 1,
    sign: '',
    start: i * 30,
    end: (i + 1) * 30,
    planets: []
  })),
  ascendant: 0,
  moonSign: 0,
  sunSign: 0,
  zodiacSigns: [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ],
  createdAt: new Date().toISOString()
};

const KPAstrologyPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('chart');

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [isUsingTestData, setIsUsingTestData] = useState(false);
  const [time, setTime] = useState<Date | undefined>(new Date());
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [chartData, setChartData] = useState<KPChartData>(defaultChartData);
  const [isChartGenerated, setIsChartGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      fullName: '',
      birthDate: '',
      birthTime: '',
      latitude: '',
      longitude: '',
      city: '',
      country: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      chartName: '',
      saveChart: false,
    },
  });

  // Load test data
  const loadTestData = useCallback(() => {
    const testData = {
      fullName: 'Test User',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      latitude: '28.6139',
      longitude: '77.2090',
      city: 'New Delhi',
      country: 'India',
      timezone: 'Asia/Kolkata',
      chartName: 'Test Chart',
      saveChart: false
    };

    // Set form values
    Object.entries(testData).forEach(([key, value]) => {
      setValue(key as keyof FormData, value as any);
    });

    // Generate chart with test data
    const form = document.querySelector('form');
    if (form) {
      setIsUsingTestData(true);
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }, [setValue]);

  // Update form values when date/time changes
  useEffect(() => {
    if (date) {
      setValue('birthDate', format(date, 'yyyy-MM-dd'));
    }
  }, [date, setValue]);

  useEffect(() => {
    if (time) {
      setValue('birthTime', format(time, 'HH:mm'));
    }
  }, [time, setValue]);

  // Load saved charts on mount
  useEffect(() => {
    if (user) {
      loadSavedCharts();
    }
  }, [user]);

  const loadSavedCharts = async () => {
    try {
      setIsLoadingSaved(true);
      const charts = await getSavedCharts();
      setSavedCharts(charts);
    } catch (error) {
      console.error('Error loading saved charts:', error);
      toast.error('Failed to load saved charts');
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleGenerateChart = useCallback(async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.birthDate || !formData.birthTime) {
        throw new Error('Please fill in all required fields');
      }

      // Convert form data to numbers
      const latitude = parseFloat(formData.latitude);
      const longitude = parseFloat(formData.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid latitude or longitude');
      }

      // Create birth date time
      const birthDateTime = new Date(`${formData.birthDate}T${formData.birthTime}:00`);
      if (isNaN(birthDateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }

      // Prepare birth data for the API
      const birthData: BirthData = {
        fullName: formData.fullName,
        birthDate: birthDateTime.toISOString(),
        birthTime: formData.birthTime,
        latitude,
        longitude,
        timezone: formData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        city: formData.city,
        country: formData.country
      };

      // Save birth data for horoscope
      setBirthData(birthData);

      // Call the API
      const response = await generateKPChart(birthData);

      // Update chart data with API response
      setChartData({
        ...response,
        createdAt: new Date().toISOString()
      });
      
      setIsChartGenerated(true);
      setActiveTab('chart'); // Switch to chart tab after generation

      // Save to history if enabled
      if (formData.saveChart && user?.uid) {
        await saveChartToHistory({
          userId: user.uid,
          chartData: response,
          chartName: formData.chartName || 'KP Chart',
          createdAt: new Date().toISOString()
        });
        toast.success('Chart generated and saved successfully!');
      } else {
        toast.success('Chart generated successfully!');
      }
    } catch (err) {
      console.error('Error generating KP chart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const onSubmit = (data: FormData) => {
    handleGenerateChart(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">KP Astrology Chart</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl">Birth Data</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h1 className="text-2xl font-bold">KP Astrology Chart Generator</h1>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={loadTestData}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Loader2 className={`h-4 w-4 ${isSubmitting && isUsingTestData ? 'animate-spin' : ''}`} />
                    {isSubmitting && isUsingTestData ? 'Generating Test Chart...' : 'Load Test Data'}
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register('fullName', { required: 'Full name is required' })}
                    placeholder="Enter full name"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      {...register('birthDate', { required: 'Birth date is required' })}
                      className={errors.birthDate ? 'border-red-500' : ''}
                    />
                    {errors.birthDate && (
                      <p className="text-sm text-red-500">{errors.birthDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="birthTime">Birth Time</Label>
                    <Input
                      id="birthTime"
                      type="time"
                      {...register('birthTime', { required: 'Birth time is required' })}
                    />
                    {errors.birthTime && (
                      <p className="text-sm text-red-500">{errors.birthTime.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      {...register('latitude', { required: 'Latitude is required' })}
                      placeholder="e.g., 28.6139"
                    />
                    {errors.latitude && (
                      <p className="text-sm text-red-500">{errors.latitude.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      {...register('longitude', { required: 'Longitude is required' })}
                      placeholder="e.g., 77.2090"
                    />
                    {errors.longitude && (
                      <p className="text-sm text-red-500">{errors.longitude.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate KP Chart'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'chart' ? (
              <Card>
                <CardHeader>
                  <CardTitle>KP Astrology Chart</CardTitle>
                  {birthData && (
                    <CardDescription>
                      {`Birth details: ${format(new Date(birthData.birthDate), 'MMMM d, yyyy')} at ${birthData.birthTime} (${birthData.timezone})`}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center min-h-[500px]">
                    {isChartGenerated ? (
                      <KPChartSVG chartData={chartData} />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>Generate a chart to see the visualization</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Horoscope</CardTitle>
                  <CardDescription>
                    {birthData ? (
                      `Horoscope for ${birthData.fullName || 'you'} based on your birth details`
                    ) : (
                      'Generate a birth chart to see your personalized horoscope'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {birthData ? (
                    <HoroscopeGenerator 
                      birthDate={format(new Date(birthData.birthDate), 'yyyy-MM-dd')}
                      sign={chartData.zodiacSigns?.[chartData.sunSign] || 'Aries'}
                      fullName={birthData.fullName}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Please generate a birth chart first to view your horoscope</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPAstrologyPage;
