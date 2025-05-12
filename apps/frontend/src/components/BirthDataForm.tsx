import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { Button, Form, FormLabel, FormControl, FormText } from 'react-bootstrap';
// import { locationData } from '@/lib/locationData'; // Removed: now using backend API for locations
import { PredictionResult } from '@shared/types/prediction';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

const GOOGLE_MAPS_API_KEY = (import.meta.env as ImportMetaEnv).VITE_GOOGLE_MAPS_API_KEY;

interface BirthData {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  state: string;
  city: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  mobile?: string;
  locationName?: string;
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
  const [formData, setFormData] = useState<BirthData>({
    fullName: '',
    dateOfBirth: '', // DD/MM/YYYY enforced
    timeOfBirth: '',
    state: '',
    city: '',
    latitude: undefined,
    longitude: undefined,
    email: '',
    mobile: '',
    locationName: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...initialData,
  });
  // For react-datepicker value
  const [datePickerValue, setDatePickerValue] = useState<Date | null>(
    initialData && initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : null
  );

  // Remove lastLocations/localStorage logic (deprecated)


  // Update form if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev: BirthData) => ({ ...prev, ...initialData }));
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

  // Fetch locations from backend
  const [locations, setLocations] = useState<any[]>([]);
  useEffect(() => {
    fetch('/locations')
      .then(res => res.json())
      .then(data => setLocations(data.locations || []))
      .catch(() => setLocations([]));
  }, []);

  const stateOptions = Array.from(new Set(locations.map(loc => loc.state)));
  const cityOptions = locations.filter(loc => loc.state === formData.state);

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
    setFormData((prev: BirthData) => ({ ...prev, [name]: value }));

    setErrors((prev: Partial<BirthData>) => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (date: Date | null) => {
    setDatePickerValue(date);
    if (date) {
      setFormData((prev: BirthData) => ({ ...prev, dateOfBirth: dayjs(date).format('DD/MM/YYYY') }));
      setErrors((prev: Partial<BirthData>) => ({ ...prev, dateOfBirth: '' }));
    } else {
      setFormData((prev: BirthData) => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<BirthData> = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth || !validateDate(formData.dateOfBirth)) newErrors.dateOfBirth = 'Date of birth is required and must be DD/MM/YYYY';
    if (!formData.timeOfBirth) newErrors.timeOfBirth = 'Time of birth is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.locationName) newErrors.locationName = 'Place of birth is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const selectedCity = locations.find(loc => loc.name === formData.city && loc.state === formData.state);
    const payload = {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      timeOfBirth: formData.timeOfBirth,
      state: formData.state,
      city: formData.city,
      latitude: selectedCity?.latitude,
      longitude: selectedCity?.longitude,
      email: formData.email,
      mobile: formData.mobile,
      locationName: formData.city + ', ' + formData.state,
      timeZone: formData.timeZone
    };

    if (!formData.latitude || !formData.longitude || !formData.timeZone) {
      try {
        const city = formData.city.trim().toLowerCase();
        const state = formData.state.trim().toLowerCase();
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
        
        console.log('Location lookup keys tried:', triedKeys);
        if (location) {
          setFormData((prev: BirthData) => ({
            ...prev,
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
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
    <form
  className="max-w-xl mx-auto mt-12 mb-12 bg-gradient-to-br from-purple-950/90 to-purple-900/80 rounded-3xl shadow-2xl p-10 space-y-10 border border-purple-800 backdrop-blur-lg font-[system-ui,sans-serif]"
  onSubmit={handleSubmit}
  aria-label="Birth Data Form"
  title="Birth Data Form"
>
  <div className="mb-8 text-center">
    <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-wide mb-2">Enter Your Birth Data</h2>
    <p className="text-purple-200 text-lg font-medium">All fields are required for accurate predictions</p>
  </div>
        <div className="space-y-2">
          <label className="block text-white text-lg font-bold tracking-wide" title="Full Name">Full Name | முழு பெயர் | पूरा नाम | పూర్తి పేరు</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name | முழு பெயர் | पूरा नाम | పూర్తి పేరు"
            className="w-full px-5 py-3 rounded-xl bg-purple-900/80 text-white placeholder-purple-300 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg shadow-sm transition-all duration-200"
            aria-label="Full Name"
            autoComplete="off"
          />
          <p className="text-purple-300 text-sm mt-1">Please enter your full name</p>
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-bold tracking-wide" title="Date of Birth">Date of Birth | பிறந்த தேதி | जन्म तारीख | పుట్టిన తేదీ</label>
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
              placeholderText="DD/MM/YYYY | பிறந்த தேதி | जन्म तारीख | పుట్టిన తేదీ"
              className="w-full px-5 py-3 pl-12 rounded-xl bg-purple-900/80 text-white placeholder-purple-300 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg shadow-sm transition-all duration-200"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              isClearable
              customInput={
                <input
                  type="text"
                  pattern="\d{2}/\d{2}/\d{4}"
                  onBlur={() => {
                    if (!datePickerValue) setErrors((e) => ({ ...e, dateOfBirth: 'Date is required' }));
                    else setErrors((prev: Partial<BirthData>) => ({ ...prev, dateOfBirth: '' }));
                  }}
                  aria-label="Date of Birth"
                  title="Date of Birth"
                  placeholder="DD/MM/YYYY | பிறந்த தேதி | जन्म तारीख | పుట్టిన తేదీ"
                  className="w-full px-5 py-3 rounded-xl bg-purple-900/80 text-white placeholder-purple-300 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg shadow-sm transition-all duration-200"
                />
              }
            />
          </div>
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-white text-lg font-bold tracking-wide">Time of Birth | பிறந்த நேரம் | जन्म का समय | పుట్టిన సమయం</label>
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
              className="w-full px-5 py-3 pl-12 rounded-xl border border-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white bg-purple-900/80 placeholder-purple-300 text-lg shadow-sm transition-all duration-200"
              aria-label="Time of Birth"
              title="Enter time in 24-hour format (e.g., 16:30 for 4:30 PM)"
              placeholder="00:00:00 | பிறந்த நேரம் | जन्म का समय | పుట్టిన సమయం"
              step="60"
              pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              onBlur={(e) => {
                if (!e.target.value) setErrors((er) => ({ ...er, timeOfBirth: 'Time is required' }));
              }}
              aria-label="Date of Birth"
              title="Date of Birth"
              placeholder="DD/MM/YYYY | பிறந்த தேதி | जन्म तारीख | పుట్టిన తేదీ"
              className="w-full px-5 py-3 rounded-xl bg-purple-900/80 text-white placeholder-purple-300 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg shadow-sm transition-all duration-200"
            />
          }
        />
      </div>
      {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
    </div>

    <div className="space-y-2">
      <label className="block text-white text-lg font-bold tracking-wide">Time of Birth | பிறந்த நேரம் | जन्म का समय | పుట్టిన సమయం</label>
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
          className="w-full px-5 py-3 pl-12 rounded-xl border border-purple-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white bg-purple-900/80 placeholder-purple-300 text-lg shadow-sm transition-all duration-200"
          aria-label="Time of Birth"
          title="Enter time in 24-hour format (e.g., 16:30 for 4:30 PM)"
          placeholder="00:00:00 | பிறந்த நேரம் | जन्म का समय | పుట్టిన సమయం"
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
      disabled={loading}
      className="w-full bg-yellow-400 text-purple-900 font-extrabold px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-yellow-400/50 disabled:opacity-60 disabled:cursor-not-allowed text-xl tracking-wide mt-4 border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
    >
      {loading ? 'Loading...' : 'Get Prediction'}
    </button>
  </form>
);

export default BirthDataForm;
