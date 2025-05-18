import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Crosshair } from 'lucide-react';
import { initAutocomplete } from '../utils/googleMaps';

interface PlaceResult {
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  formatted_address?: string;
  name?: string;
  place_id?: string;
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

  // Initialize the autocomplete
  useEffect(() => {
    if (!inputRef.current) return;

    const init = async () => {
      try {
        autocompleteRef.current = initAutocomplete(
          inputRef.current!,
          (place: PlaceResult) => {
            if (place.geometry && place.geometry.location) {
              onLocationSelect({
                address: place.formatted_address || place.name || '',
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                placeId: place.place_id,
              });
              setShowClearButton(true);
            }
          },
          {
            types,
            componentRestrictions: {
              country: countryRestriction,
            },
          }
        );
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    };

    // Only initialize if Google Maps is loaded
    if (window.google?.maps?.places) {
      init();
    } else {
      // Try to load the Google Maps script if not already loaded
      const script = document.createElement('script');
      // Ensure we have a valid API key
      const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
      if (!apiKey) {
        console.error('Google Maps API key is not set. Please check your environment variables.');
        return;
      }
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      if (autocompleteRef.current && inputRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(inputRef.current);
      }
    };
  }, [onLocationSelect, countryRestriction, types]);

  const handleClear = () => {
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
  };

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
          
          // Use reverse geocoding to get the address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
              setIsLoading(false);
              
              if (status === 'OK' && results && results[0]) {
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
