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

const loadScript = (url: string) => {
  const existingScript = document.querySelector(`script[src="${url}"]`);
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
  }
};

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({ apiKey, onSelect, defaultValue, onLoading, placeholder }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const loadingTimeout = useRef<any>(null);

  useEffect(() => {
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`);
    const interval = setInterval(() => {
      if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
        clearInterval(interval);
        if (inputRef.current) {
          autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
            types: ['(cities)'],
            componentRestrictions: { country: 'in' },
          });
          autocompleteRef.current.addListener('place_changed', async () => {
            if (onLoading) onLoading(true);
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry) {
              if (onLoading) onLoading(false);
              return;
            }
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const locationName = place.formatted_address || place.name;
            // Fetch timezone
            let timeZone = '';
            try {
              const timestamp = Math.floor(Date.now() / 1000);
              const tzResp = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`);
              const tzData = await tzResp.json();
              timeZone = tzData.timeZoneId || '';
            } catch {
              timeZone = '';
            }
            onSelect({
              locationName,
              latitude: String(lat),
              longitude: String(lng),
              timeZone,
            });
            if (onLoading) onLoading(false);
          });
        }
      }
    }, 300);
    return () => {
      clearInterval(interval);
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
    };
  }, [apiKey, onSelect, onLoading]);

  return (
    <div className="google-places-autocomplete" style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 8, top: 8, color: '#888', zIndex: 2 }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path></svg>
      </span>
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder={placeholder || 'Start typing a city name (e.g., Chennai, Delhi)'}
        style={{ paddingLeft: 36, width: '100%', height: 36, borderRadius: 6, border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default GooglePlacesAutocomplete;
