export interface PlanetData {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface HouseData {
  house: number;
  sign: string;
  cusp: number;
}

export interface ChartData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: {
    sun: PlanetData;
    moon: PlanetData;
    mercury: PlanetData;
    venus: PlanetData;
    mars: PlanetData;
    jupiter: PlanetData;
    saturn: PlanetData;
    uranus: PlanetData;
    neptune: PlanetData;
    pluto: PlanetData;
  };
  houses: HouseData[];
  aspects: any[]; // You might want to type this more specifically
}

export interface Prediction {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionState {
  loading: boolean;
  saving: boolean;
  exporting: boolean;
  error: string | null;
  sessionId: string | null;
  chartData: ChartData | null;
  predictions: Prediction[];
  insights: any[]; // You might want to type this more specifically
  shareWithClient: boolean;
  pdfUrl: string | null;
  exportSuccess: boolean;
  step: number;
  userRole: 'astrologer' | 'client';
  uid: string;
  fullName: string;
  mockMode: boolean;
}
