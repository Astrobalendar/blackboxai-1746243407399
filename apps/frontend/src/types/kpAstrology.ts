export type PlanetName = 
  | 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' 
  | 'venus' | 'saturn' | 'rahu' | 'ketu' | string;

export interface PlanetPosition {
  name: PlanetName;
  sign: number;          // 0-11 for Aries to Pisces
  degree: number;        // 0-29.999 degrees
  nakshatra: string;     // Nakshatra name
  nakshatraLord: string; // Ruling planet of nakshatra
  subLord: string;       // Sub-lord of the planet
  retrograde?: boolean;  // If the planet is retrograde
  x?: number;            // SVG x-coordinate (calculated)
  y?: number;           // SVG y-coordinate (calculated)
}

export interface HouseCusp {
  number: number;        // 1-12
  sign: string;          // Zodiac sign
  start: number;         // Starting degree
  end: number;           // Ending degree
  planets: PlanetName[]; // Planets in this house
}

export interface KPChartData {
  houses: HouseCusp[];
  planets: PlanetPosition[];
  ascendant: number;    // Degree of ascendant (0-359.999)
  zodiacSigns: string[]; // Names of zodiac signs
  moonSign: number;      // Moon sign index (0-11)
  sunSign: number;      // Sun sign index (0-11)
  createdAt?: string;    // ISO timestamp of chart creation
  updatedAt?: string;    // ISO timestamp of last update
}

export interface BirthData {
  fullName: string;     // User's full name
  birthDate: string;    // ISO 8601 date string
  birthTime: string;    // 24-hour format (HH:mm)
  latitude: number;     // Decimal degrees (-90 to 90)
  longitude: number;    // Decimal degrees (-180 to 180)
  timezone?: string;    // IANA timezone (e.g., 'America/New_York')
  city?: string;        // Birth city
  country?: string;      // Birth country
}

export interface ChartPosition {
  x: number;
  y: number;
  angle: number;
  radius: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  center: number;
  radius: number;
  padding: number;
}

export interface TooltipPosition {
  x: number;
  y: number;
  visible: boolean;
}

export type AspectRatio = 'square' | 'wide' | 'tall';

export interface ChartExportOptions {
  format: 'png' | 'jpeg' | 'pdf' | 'svg';
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
}
