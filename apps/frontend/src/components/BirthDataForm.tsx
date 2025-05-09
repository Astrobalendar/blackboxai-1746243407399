import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { Button, Form, FormLabel, FormControl, FormText } from 'react-bootstrap';
import { locationData } from '@/lib/locationData';
import { PredictionResult } from '@shared/types/prediction';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';


interface BirthData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  state: string;
  district: string;
  city: string;
  latitude: string;
  longitude: string;
  timeZone: string;
}

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  loading: boolean;
  error: string | null;
  initialData?: Partial<BirthData>;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({ onSubmit, loading, error, initialData }) => {
  // Add locationName for Firestore
  const [formData, setFormData] = useState<any>({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    state: '',
    district: '',
    city: '',
    latitude: '',
    longitude: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locationName: '',
    ...initialData,
  });
  // For react-datepicker value
  const [datePickerValue, setDatePickerValue] = useState<Date | null>(
    initialData && initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : null
  );

  // Update form if initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      if (initialData.dateOfBirth) {
        setDatePickerValue(new Date(initialData.dateOfBirth));
      }
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Partial<BirthData>>({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [showFallbackAlert, setShowFallbackAlert] = useState(false);
  const [cityAutocompleteUsed, setCityAutocompleteUsed] = useState(false);
  const [lastLocations, setLastLocations] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('astrobalendar_last_locations') || '[]');
    } catch {
      return [];
    }
  });
  const cityInputRef = useRef<HTMLInputElement>(null);


  // Dynamically compute city options based on selected state
  let districtOptions: string[] = [];
  let cityOptions: string[] = [];
  try {
    const countryData = locationData['India'] as Record<string, any>;
    if (formData.state && countryData && countryData[formData.state]) {
      const stateData = countryData[formData.state] as Record<string, any>;
      districtOptions = Object.keys(stateData);
      if (formData.district && stateData[formData.district]) {
        cityOptions = stateData[formData.district];
      }
    }
  } catch (e) {
    districtOptions = [];
    cityOptions = [];
  }

  const statesOfIndia = [
    '', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const validateDate = (date: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);

    if (dateObj.getFullYear() !== year) return false;
    if (dateObj.getMonth() !== month - 1) return false;
    if (dateObj.getDate() !== day) return false;

    return true;
  };

  const validateTime = (time: string): boolean => {
    const regex = /^(\d{2}):(\d{2})$/;
    if (!regex.test(time)) return false;

    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the changed field
    setErrors((prev: typeof errors) => ({
      ...prev,
      [name]: ''
    }));
  };

  // Date picker change handler
  const handleDateChange = (date: Date | null) => {
    setDatePickerValue(date);
    if (date) {
      // Store as DD/MM/YYYY for display, ISO for backend
      setFormData(prev => ({
        ...prev,
        dateOfBirth: dayjs(date).format('DD/MM/YYYY')
      }));
      setErrors((prev: typeof errors) => ({ ...prev, dateOfBirth: '' }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Partial<BirthData> = {};

    // Validate required fields
    const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'state', 'district', 'city'] as const;
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate date format
    if (!datePickerValue || !validateDate(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
    }

    // Validate time format
    if (formData.timeOfBirth && !validateTime(formData.timeOfBirth)) {
      newErrors.timeOfBirth = 'Please enter a valid time (HH:MM)';
    }

    // If there are any errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If location data is missing, try to get it using geocoding
    if (!formData.latitude || !formData.longitude || !formData.timeZone) {
      try {
        // Normalize all address parts
        const city = formData.city.trim().toLowerCase();
        const state = formData.state.trim().toLowerCase();
        const district = formData.district.trim().toLowerCase();
        const address = `${city}, ${state}, india`;
        const mockLocationData: Record<string, { latitude: string; longitude: string; timeZone: string }> = {
          'sholinghur, tamil nadu, india': { latitude: '13.1132', longitude: '79.4182', timeZone: 'Asia/Kolkata' },
          'sholinghur, arcot, tamil nadu, india': { latitude: '13.1132', longitude: '79.4182', timeZone: 'Asia/Kolkata' },
          'sholinghur, vellore, tamil nadu, india': { latitude: '13.1210', longitude: '79.4182', timeZone: 'Asia/Kolkata' },
          'mumbai, maharashtra, india': { latitude: '19.0760', longitude: '72.8777', timeZone: 'Asia/Kolkata' },
          'delhi, delhi, india': { latitude: '28.7041', longitude: '77.1025', timeZone: 'Asia/Kolkata' },
          'kolkata, west bengal, india': { latitude: '22.5726', longitude: '88.3639', timeZone: 'Asia/Kolkata' },
          'hyderabad, telangana, india': { latitude: '17.3850', longitude: '78.4867', timeZone: 'Asia/Kolkata' }
        };
        // Try with city+state only, fallback to city+district+state if needed
        let location = mockLocationData[address];
        let triedKeys = [address];
        if (!location && formData.district) {
          const districtAddress = `${city}, ${district}, ${state}, india`;
          location = mockLocationData[districtAddress];
          triedKeys.push(districtAddress);
        }
        console.log('Location lookup keys tried:', triedKeys);
        if (location) {
          setFormData(prev => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
            timeZone: location.timeZone
          }));
        } else {
          throw new Error('Missing or invalid location');
        }
      } catch (error) {
        console.error('Error getting location data:', error);
        newErrors.city = 'Could not find location data';
        setErrors(newErrors);
        return;
      }
    }

    // Convert date to ISO string for backend
    const submitData = {
      ...formData,
      dateOfBirth: datePickerValue ? dayjs(datePickerValue).format('YYYY-MM-DD') : formData.dateOfBirth,
      latitude: formData.latitude,
      longitude: formData.longitude,
      timeZone: formData.timeZone
    };
    console.log('Submitting birth data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="text-purple-400 text-sm mt-1">Please enter your full name</p>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Date of Birth</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-purple-300" title="Calendar">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <DatePicker
              selected={datePickerValue}
              onChange={handleDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="DD-MM-YYYY"
              className="w-full px-4 py-3 pl-10 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              isClearable
              onBlur={() => {
                if (!datePickerValue) setErrors((e) => ({ ...e, dateOfBirth: 'Date is required' }));
                else setErrors((e) => ({ ...e, dateOfBirth: '' }));
              }}
              customInput={<input type="text" pattern="\d{2}-\d{2}-\d{4}" />}
            />
          </div>
          <p className="text-purple-400 text-sm mt-1" title="Please select date of birth">
            Please select date of birth
          </p>
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="State"
            required
          >
            <option value="">Select state</option>
            {statesOfIndia.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">District</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="District"
            required
            disabled={!formData.state}
          >
            <option value="">{!formData.state ? 'Select state first' : 'Select district'}</option>
            {districtOptions.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">City / Town / Village</label>
          {GOOGLE_MAPS_API_KEY ? (
            <GooglePlacesAutocomplete
              apiKey={GOOGLE_MAPS_API_KEY}
              onSelect={(loc) => {
                setFormData((prev) => ({
                  ...prev,
                  city: loc.locationName,
                  locationName: loc.locationName,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  timeZone: loc.timeZone,
                }));
                setCityAutocompleteUsed(true);
                setShowFallbackAlert(false);
                // Cache last 3 locations
                const updated = [loc, ...lastLocations.filter((l) => l.locationName !== loc.locationName)].slice(0, 3);
                setLastLocations(updated);
                localStorage.setItem('astrobalendar_last_locations', JSON.stringify(updated));
              }}
              defaultValue={formData.city || (lastLocations[0]?.locationName || '')}
              onLoading={setLocationLoading}
              placeholder="Start typing a city name (e.g., Chennai, Delhi)"
            />
          ) : (
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="City / Town / Village"
              required
              disabled={!formData.district}
            >
              <option value="">{!formData.district ? 'Select district first' : cityOptions.length ? 'Select city/town/village' : 'No cities available'}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-semibold">Time of Birth</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-purple-300" title="Clock">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </span>
            <input
              type="time"
              name="timeOfBirth"
              value={formData.timeOfBirth}
              onChange={handleInputChange}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
              aria-label="Time of Birth"
              title="Enter time in 24-hour format (e.g., 16:30 for 4:30 PM)"
              placeholder="HH:mm"
              step="60"
              pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              onBlur={(e) => {
                if (!e.target.value) setErrors((er) => ({ ...er, timeOfBirth: 'Time is required' }));
                else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(e.target.value)) setErrors((er) => ({ ...er, timeOfBirth: 'Enter time in 24-hour format (e.g., 16:30)' }));
                else setErrors((er) => ({ ...er, timeOfBirth: '' }));
              }}
            />
          </div>
          <p className="text-purple-400 text-sm mt-1" title="Enter time in 24-hour format (e.g., 16:30 for 4:30 PM)">
            Enter time in 24-hour format (e.g., 16:30 for 4:30 PM)
          </p>
          {errors.timeOfBirth && <p className="text-red-500 text-sm mt-1">{errors.timeOfBirth}</p>}
        </div>

        <button
          type="submit"
          disabled={false}
          className="w-full bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Get Prediction
        </button>
      </div>
    </form>
  );
};

export default BirthDataForm;
