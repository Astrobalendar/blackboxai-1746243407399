import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';
import type { GeocoderResult, GeocoderStatus, PlaceResult } from '../utils/googleMaps';

// Extend the global window interface with our custom properties
declare global {
  interface Window {
    googleMapsReady?: boolean;
  }
}

interface LocationResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  showCurrentLocation?: boolean;
  countryRestriction?: string | string[];
  types?: string[];
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Enter a location',
  disabled = false,
  error,
  className = '',
  inputClassName = '',
  showCurrentLocation = true,
  countryRestriction = 'in',
  types = ['(cities)'],
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showClearButton, setShowClearButton] = useState(!!value);
  const autocompleteRef = useRef<any>(null);
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps?.places);

  // Handle Google Maps script loading
  useEffect(() => {
    let mounted = true;
    
    const checkAndSetMapsReady = () => {
      if (window.google?.maps?.places) {
        console.log('Google Maps is ready');
        if (mounted) setMapsReady(true);
        return true;
      }
      return false;
    };

    // Check if already loaded
    if (checkAndSetMapsReady()) return;

    // Set up event listener for when Google Maps loads
    const handleMapsReady = () => {
      console.log('Received google-maps-ready event');
      checkAndSetMapsReady();
    };

    // Check if the ready flag is already set
    if (window.googleMapsReady) {
      console.log('Google Maps ready flag is set');
      if (mounted) setMapsReady(true);
    } else {
      console.log('Adding event listener for google-maps-ready');
      document.addEventListener('google-maps-ready', handleMapsReady);
    }

    // Cleanup
    return () => {
      mounted = false;
      document.removeEventListener('google-maps-ready', handleMapsReady);
    };
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!mapsReady || !inputRef.current) return;

    let isMounted = true;
    let autocomplete: any = null;

    try {
      const currentInput = inputRef.current;
      console.log('Initializing Google Places Autocomplete on input');

      const options = {
        types,
        componentRestrictions: countryRestriction ? { country: countryRestriction } : undefined,
      };

      autocomplete = new window.google.maps.places.Autocomplete(currentInput, options);
      
      autocomplete.addListener('place_changed', () => {
        if (!isMounted) return;
        
        const place = autocomplete.getPlace();
        console.log('Place selected:', place);
        
        if (place?.geometry?.location) {
          const location = {
            address: place.formatted_address || place.name || currentInput.value,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id || '',
          };
          console.log('Location selected:', location);
          onLocationSelect(location);
          setShowClearButton(true);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }

    return () => {
      isMounted = false;
      if (autocomplete && inputRef.current) {
        window.google?.maps?.event.clearInstanceListeners(inputRef.current);
      }
    };
  }, [mapsReady, onLocationSelect, countryRestriction, types]);

  const handleClear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      onChange('');
      setShowClearButton(false);
      onLocationSelect({
        address: '',
        lat: 0,
        lng: 0,
        placeId: '',
      });
    }
  }, [onChange, onLocationSelect]);

  // Handle getting current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          if (!window.google?.maps?.Geocoder) {
            console.error('Google Maps Geocoder not available');
            setIsLoading(false);
            return;
          }
          
          // Use reverse geocoding to get the address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: (GeocoderResult | null)[] | null, status: GeocoderStatus) => {
              setIsLoading(false);
              
              if (status === 'OK' && results?.[0]) {
                const address = results[0].formatted_address || `${latitude}, ${longitude}`;
                if (inputRef.current) {
                  inputRef.current.value = address;
                }
                onChange(address);
                onLocationSelect({
                  address,
                  lat: latitude,
                  lng: longitude,
                  placeId: results[0].place_id || '',
                });
                setShowClearButton(true);
              } else {
                console.error('Geocoder failed due to: ' + status);
              }
            }
          );
        } catch (error) {
          console.error('Error getting current location:', error);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onChange, onLocationSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);
    setShowClearButton(!!value);
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full pl-10 pr-10 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm ${inputClassName}`}
          autoComplete="off"
        />
        {showClearButton && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear location"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {showCurrentLocation && !disabled && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
              isLoading ? 'text-gray-400' : 'text-yellow-600 hover:text-yellow-800'
            }`}
            aria-label="Use current location"
            title="Use current location"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-4 w-4 text-yellow-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LocationAutocomplete;
