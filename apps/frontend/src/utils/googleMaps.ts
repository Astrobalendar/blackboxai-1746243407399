/// <reference lib="dom" />
/* global google, window, document, console, setTimeout, clearTimeout, Event */

// Google Maps type definitions and utilities

export type GeocoderResult = {
  formatted_address?: string;
  place_id?: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
    viewport?: any;
  };
  address_components?: any[];
  types?: string[];
  [key: string]: any;
};

export type GeocoderStatus = 
  | 'OK' 
  | 'ZERO_RESULTS' 
  | 'ERROR' 
  | 'INVALID_REQUEST' 
  | 'OVER_QUERY_LIMIT' 
  | 'REQUEST_DENIED' 
  | 'UNKNOWN_ERROR';






export const initAutocomplete = (
  input: HTMLInputElement,
  onPlaceChanged: (_place: google.maps.places.PlaceResult) => void,
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
    const placeResult = autocomplete.getPlace();
    if (placeResult.geometry && placeResult.geometry.location) {
      onPlaceChanged(placeResult);
    }
  });

  return autocomplete;
};

export const geocodeByPlaceId = async (
  placeId: string
): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}> => {
  if (!window.google?.maps?.Geocoder) {
    throw new Error('Google Maps Geocoder not available');
  }

  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { placeId },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results?.[0]) {
          const result = results[0];
          const location = result.geometry?.location;
          const formattedAddress = result.formatted_address || 'Unnamed location';
          const resultPlaceId = result.place_id || placeId;
          
          if (!location) {
            reject(new Error('No location data available'));
            return;
          }

          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress,
            placeId: resultPlaceId,
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      }
    );
  });
};

let scriptLoadingPromise: Promise<boolean> | null = null;

export const loadGoogleMapsScript = (apiKey: string): Promise<boolean> => {
  // If script is already loaded, return resolved promise
  if (window.google?.maps?.places) {
    console.log('Google Maps already loaded');
    return Promise.resolve(true);
  }

  // If script is currently loading, return the existing promise
  if (scriptLoadingPromise) {
    console.log('Google Maps script already loading');
    return scriptLoadingPromise;
  }

  console.log('Loading Google Maps script...');
  
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Set a timeout for script loading
    const timeoutId = setTimeout(() => {
      reject(new Error('Google Maps script loading timed out'));
    }, 10000); // 10 seconds timeout

    // Global callback for when Google Maps is ready
    (window as any).initGoogleMaps = () => {
      console.log('Google Maps API loaded successfully');
      clearTimeout(timeoutId);
      window.googleMapsReady = true;
      document.dispatchEvent(new Event('google-maps-ready'));
      resolve(true);
    };

    script.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
      clearTimeout(timeoutId);
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};
