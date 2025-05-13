import React, { useEffect, useRef } from 'react';

interface GooglePlacesAutocompleteProps {
  apiKey: string;
  onSelect: (result: {
    locationName: string;
    latitude: string;
    longitude: string;
    timeZone: string;
  }) => void;
  defaultValue?: string;
  onLoading?: (loading: boolean) => void;
  placeholder?: string;
}

// IMPORTANT: Make sure 'Places API (New)' is enabled for your API key in Google Cloud Console.
// Only load the script once per page and do NOT use 'placeswebcomponent' in the libraries list.
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-js';
const loadScript = (url: string) => {
  if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  script.id = GOOGLE_MAPS_SCRIPT_ID;
  document.body.appendChild(script);
};

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({ apiKey, onSelect, defaultValue, onLoading, placeholder }) => {
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const loadingTimeout = useRef<any>(null);


  // Helper to trigger onSelect for free-typed value
  const handleManualInput = () => {
    // Find the input element inside the container
    const input = inputContainerRef.current?.querySelector('input');
    if (input) {
      const val = input.value;
      onSelect({
        locationName: val,
        latitude: '',
        longitude: '',
        timeZone: '',
      });
    }
  };


  useEffect(() => {
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`);
    let placeHandler: any = null;
    const interval = setInterval(() => {
      if (
        (window as any).google &&
        (window as any).google.maps &&
        (window as any).google.maps.places &&
        customElements.get('gmp-place-autocomplete')
      ) {
        clearInterval(interval);
        if (inputContainerRef.current) {
          // Clean up if already present
          inputContainerRef.current.innerHTML = '';
          // Create the web component
          if (customElements.get('gmp-place-autocomplete')) {
            const gmpEl = document.createElement('gmp-place-autocomplete');
            if (placeholder) gmpEl.setAttribute('placeholder', placeholder);
            if (defaultValue) gmpEl.setAttribute('value', defaultValue);
            gmpEl.setAttribute(
              'style',
              'width: 100%; height: 36px; border-radius: 6px; border: 1px solid #ccc; padding-left: 36px;'
            );
            // Listen for place change
            placeHandler = async (e: any) => {
              if (onLoading) onLoading(true);
              const place = e.target.value;
              let lat = '';
              let lng = '';
              let locationName = '';
              if (place && place.geometry && place.geometry.location) {
                lat = place.geometry.location.lat;
                lng = place.geometry.location.lng;
                locationName = place.formatted_address || place.name;
              } else if (place && (place.formatted_address || place.name)) {
                locationName = place.formatted_address || place.name;
              } else if (place) {
                locationName = place;
              }
              // Fetch timezone if lat/lng present
              let timeZone = '';
              if (lat && lng) {
                try {
                  const timestamp = Math.floor(Date.now() / 1000);
                  const tzResp = await fetch(
                    `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
                  );
                  const tzData = await tzResp.json();
                  timeZone = tzData.timeZoneId || '';
                } catch {
                  timeZone = '';
                }
              }
              onSelect({
                locationName,
                latitude: String(lat),
                longitude: String(lng),
                timeZone,
              });
              if (onLoading) onLoading(false);
            };
            gmpEl.addEventListener('gmp-placeautocomplete-placechange', placeHandler);
            inputContainerRef.current.appendChild(gmpEl);
            autocompleteRef.current = gmpEl;
          } else {
            // Fallback: Standard input for free typing
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder || '';
            input.defaultValue = defaultValue || '';
            input.style.width = '100%';
            input.style.height = '36px';
            input.style.borderRadius = '6px';
            input.style.border = '1px solid #ccc';
            input.style.paddingLeft = '12px';
            input.onblur = handleManualInput;
            input.onkeydown = (e: KeyboardEvent) => {
              if (e.key === 'Enter') handleManualInput();
            };
            inputContainerRef.current.appendChild(input);
          }
        }
      }
    }, 300);
    return () => {
      clearInterval(interval);
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
      // Remove event listener if present
      if (autocompleteRef.current && placeHandler) {
        autocompleteRef.current.removeEventListener('gmp-placeautocomplete-placechange', placeHandler);
      }
    };
  }, [apiKey, onSelect, onLoading, defaultValue, placeholder]);

  return (
    <div className="google-places-autocomplete" style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 8, top: 8, color: '#888', zIndex: 2 }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path>
        </svg>
      </span>
      <div ref={inputContainerRef} style={{ width: '100%' }} />
    </div>
  );
};

export default GooglePlacesAutocomplete;