// Utility functions for Google Maps integration

type GoogleMaps = typeof google.maps;

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, opts?: any) => any;
          AutocompleteService: new () => any;
          PlacesServiceStatus: {
            INVALID_REQUEST: string;
            NOT_FOUND: string;
            OK: string;
            OVER_QUERY_LIMIT: string;
            REQUEST_DENIED: string;
            UNKNOWN_ERROR: string;
            ZERO_RESULTS: string;
          };
        };
        Geocoder: new () => any;
        GeocoderStatus: {
          ERROR: string;
          INVALID_REQUEST: string;
          OK: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          UNKNOWN_ERROR: string;
          ZERO_RESULTS: string;
        };
        LatLng: new (lat: number, lng: number) => any;
      };
    };
  }
}

export interface PlaceResult {
  address_components: any[];
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
    viewport: any;
  };
  name: string;
  place_id: string;
  types: string[];
}

export const initAutocomplete = (
  input: HTMLInputElement,
  onPlaceChanged: (place: PlaceResult) => void,
  options: {
    types?: string[];
    componentRestrictions?: { country: string | string[] };
  } = {}
) => {
  if (!input) return null;

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    types: options.types || ['(cities)'],
    componentRestrictions: options.componentRestrictions || { country: 'in' },
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      onPlaceChanged(place);
    }
  });

  return autocomplete;
};

export const geocodeByPlaceId = (
  placeId: string
): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}> => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ placeId }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          formattedAddress: results[0].formatted_address,
          placeId: results[0].place_id,
        });
      } else {
        reject(new Error('Geocode was not successful for the following reason: ' + status));
      }
    });
  });
};

export const loadGoogleMapsScript = (apiKey: string): Promise<boolean> => {
  if (document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};
