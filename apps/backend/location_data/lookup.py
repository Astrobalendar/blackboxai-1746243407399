import json
import os
import requests
from typing import Optional, Dict

INDIAN_LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), 'indian_locations.json')
GOOGLE_GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode/json'
GOOGLE_TIMEZONE_API = 'https://maps.googleapis.com/maps/api/timezone/json'
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')


def load_indian_locations():
    with open(INDIAN_LOCATIONS_PATH, encoding='utf-8') as f:
        return json.load(f)


def find_location_in_static(city: str, state: str = None, district: str = None) -> Optional[Dict]:
    locations = load_indian_locations()
    city_norm = city.strip().lower()
    state_norm = state.strip().lower() if state else None
    district_norm = district.strip().lower() if district else None
    print(f"[Location Lookup] Searching for city='{city_norm}', state='{state_norm}', district='{district_norm}'")
    for loc in locations:
        loc_city = loc['city'].strip().lower()
        loc_state = loc['state'].strip().lower()
        loc_district = loc['district'].strip().lower() if 'district' in loc else None
        if loc_city == city_norm:
            if state_norm and loc_state != state_norm:
                continue
            if district_norm and loc_district != district_norm:
                continue
            print(f"[Location Lookup] Found location: {loc}")
            return loc
    print(f"[Location Lookup] No match found for city='{city_norm}', state='{state_norm}', district='{district_norm}'")
    return None


def geocode_with_google(city: str, state: str = None, district: str = None, country: str = 'India') -> Optional[Dict]:
    if not GOOGLE_API_KEY:
        return None
    address = ', '.join(filter(None, [city, district, state, country]))
    params = {'address': address, 'key': GOOGLE_API_KEY}
    resp = requests.get(GOOGLE_GEOCODE_API, params=params)
    data = resp.json()
    if data.get('status') == 'OK' and data['results']:
        loc = data['results'][0]['geometry']['location']
        lat, lng = loc['lat'], loc['lng']
        # Timezone lookup
        tz_params = {
            'location': f'{lat},{lng}',
            'timestamp': 1589878800,  # Use a fixed timestamp (or current time)
            'key': GOOGLE_API_KEY
        }
        tz_resp = requests.get(GOOGLE_TIMEZONE_API, params=tz_params)
        tz_data = tz_resp.json()
        timezone = tz_data.get('timeZoneId', 'Asia/Kolkata')
        return {
            'city': city,
            'district': district or '',
            'state': state or '',
            'latitude': lat,
            'longitude': lng,
            'timezone': timezone
        }
    return None


def get_location_info(city: str, state: str = None, district: str = None, country: str = 'India') -> Optional[Dict]:
    # Try static dataset first
    static_result = find_location_in_static(city, state, district)
    if static_result:
        return static_result
    # Fallback to Google API
    google_result = geocode_with_google(city, state, district, country)
    return google_result
