export interface AstrologicalPrediction {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: string;
  longitude: string;
  timeZone: string;
  houses: {
    [key: string]: {
      name: string;
      description: string;
      influences: string[];
    };
  };
}
