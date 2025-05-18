import * as React from 'react';
import { useState, useEffect } from 'react';
import { loadGoogleMapsScript } from '../utils/googleMaps';
import LocationAutocomplete from './LocationAutocomplete';
interface BirthDataFormProps {
  onSubmit: (data: {
    fullName: string;
    gender: string;
    fatherName: string;
    familyName: string;
    gothram: string;
    dateOfBirth: string;
    timeOfBirth: string;
    locationName: string;
    latitude: string;
    longitude: string;
    fullAddress: string;
  }) => void;
  loading: boolean;
  error: string | null;
  initialData?: {
    fullName?: string;
    gender?: string;
    fatherName?: string;
    familyName?: string;
    gothram?: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    locationName?: string;
    latitude?: string;
    longitude?: string;
    fullAddress?: string;
  };
  language?: 'en' | 'ta' | 'hi' | 'te';
}


const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
];

const LABELS = {
  fullName: {
    en: 'Full Name',
    ta: 'முழு பெயர்',
    hi: 'पूरा नाम',
    te: 'పూర్తి పేరు',
  },
  gender: {
    en: 'Gender',
    ta: 'பாலினம்',
    hi: 'लिंग',
    te: 'లింగం',
  },
  fatherName: {
    en: "Father's Name",
    ta: 'தந்தையின் பெயர்',
    hi: 'पिता का नाम',
    te: 'తండ్రి పేరు',
  },
  familyName: {
    en: 'Family Name',
    ta: 'குடும்ப பெயர்',
    hi: 'परिवार का नाम',
    te: 'కుటుంబ పేరు',
  },
  gothram: {
    en: 'Gothram',
    ta: 'கோத்ரம்',
    hi: 'गोत्र',
    te: 'గోత్రం',
  },
  dateOfBirth: {
    en: 'Date of Birth',
    ta: 'பிறந்த தேதி',
    hi: 'जन्म तिथि',
    te: 'పుట్టిన తేది',
  },
  timeOfBirth: {
    en: 'Time of Birth',
    ta: 'பிறந்த நேரம்',
    hi: 'जन्म समय',
    te: 'పుట్టిన సమయం',
  },
  locationName: {
    en: 'Place of Birth',
    ta: 'பிறந்த இடம்',
    hi: 'जन्म स्थान',
    te: 'పుట్టిన ప్రదేశం',
  },
};

const PLACEHOLDERS = {
  fullName: {
    en: 'Enter your full name',
    ta: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    hi: 'अपना पूरा नाम दर्ज करें',
    te: 'మీ పూర్తి పేరును నమోదు చేయండి',
  },
  gender: {
    en: 'Select gender',
    ta: 'பாலினத்தை தேர்ந்தெடுக்கவும்',
    hi: 'लिंग चुनें',
    te: 'లింగాన్ని ఎంచుకోండి',
  },
  fatherName: {
    en: "Enter father's name",
    ta: 'தந்தையின் பெயரை உள்ளிடவும்',
    hi: 'पिता का नाम दर्ज करें',
    te: 'తండ్రి పేరును నమోదు చేయండి',
  },
  familyName: {
    en: 'Enter family name',
    ta: 'குடும்ப பெயரை உள்ளிடவும்',
    hi: 'परिवार का नाम दर्ज करें',
    te: 'కుటుంబ పేరును నమోదు చేయండి',
  },
  gothram: {
    en: 'Enter gothram',
    ta: 'கோத்ரத்தை உள்ளிடவும்',
    hi: 'गोत्र दर्ज करें',
    te: 'గోత్రాన్ని నమోదు చేయండి',
  },
  dateOfBirth: {
    en: 'YYYY-MM-DD',
    ta: 'YYYY-MM-DD',
    hi: 'YYYY-MM-DD',
    te: 'YYYY-MM-DD',
  },
  timeOfBirth: {
    en: 'HH:MM (24h)',
    ta: 'HH:MM (24h)',
    hi: 'HH:MM (24h)',
    te: 'HH:MM (24h)',
  },
  locationName: {
    en: 'Enter place of birth',
    ta: 'பிறந்த இடத்தை உள்ளிடவும்',
    hi: 'जन्म स्थान दर्ज करें',
    te: 'పుట్టిన ప్రదేశాన్ని నమోదు చేయండి',
  },
};

const ERROR_REQUIRED = {
  fullName: {
    en: 'Full name is required',
    ta: 'முழு பெயர் தேவை',
    hi: 'पूरा नाम आवश्यक है',
    te: 'పూర్తి పేరు అవసరం',
  },
  gender: {
    en: 'Gender is required',
    ta: 'பாலினம் தேவை',
    hi: 'लिंग आवश्यक है',
    te: 'లింగం అవసరం',
  },
  dateOfBirth: {
    en: 'Date of birth is required',
    ta: 'பிறந்த தேதி தேவை',
    hi: 'जन्म तिथि आवश्यक है',
    te: 'పుట్టిన తేది అవసరం',
  },
  dateOfBirthFormat: {
    en: 'Date must be in YYYY-MM-DD format',
    ta: 'தேதி YYYY-MM-DD வடிவில் இருக்க வேண்டும்',
    hi: 'तिथि YYYY-MM-DD प्रारूप में होनी चाहिए',
    te: 'తేది YYYY-MM-DD ఫార్మాట్‌లో ఉండాలి',
  },
  timeOfBirth: {
    en: 'Time of birth is required',
    ta: 'பிறந்த நேரம் தேவை',
    hi: 'जन्म समय आवश्यक है',
    te: 'పుట్టిన సమయం అవసరం',
  },
  timeOfBirthFormat: {
    en: 'Time must be in HH:MM format',
    ta: 'நேரம் HH:MM வடிவில் இరுக்க வேண்டும்',
    hi: 'समय HH:MM प्रारूप में होना चाहिए',
    te: 'సమయం HH:MM ఫార్మాట్‌లో ఉండాలి',
  },
  locationName: {
    en: 'Place of birth is required',
    ta: 'பிறந்த இடம் தேவை',
    hi: 'जन्म स्थान आवश्यक है',
    te: 'పుట్టిన ప్రదేశం అవసరం',
  },
};

// Remove unused imports

const BirthDataForm = ({
  onSubmit,
  loading,
  error,
  initialData = {},
  language = 'en' as const,
}: BirthDataFormProps) => {
  const [form, setForm] = useState({
    fullName: initialData?.fullName || '',
    gender: initialData?.gender || '',
    fatherName: initialData?.fatherName || '',
    familyName: initialData?.familyName || '',
    gothram: initialData?.gothram || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    timeOfBirth: initialData?.timeOfBirth || '',
    locationName: initialData?.locationName || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    fullAddress: initialData?.fullAddress || '',
  });

  // Load Google Maps script when component mounts
  useEffect(() => {
    // Replace with your actual Google Maps API key from environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (apiKey) {
      loadGoogleMapsScript(apiKey).catch(error => {
        console.error('Failed to load Google Maps script:', error);
      });
    }
  }, []);

  const handleLocationSelect = React.useCallback((location: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => {
    setForm(f => ({
      ...f,
      locationName: location.address,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      fullAddress: location.address
    }));
  }, []);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = ERROR_REQUIRED.fullName[language];
    }
    if (!form.gender.trim() || !['Male','Female','Other'].includes(form.gender)) {
      newErrors.gender = 'Gender is required';
    }
    if (!form.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required';
    }
    if (!form.familyName.trim()) {
      newErrors.familyName = 'Family name is required';
    }
    if (!form.gothram.trim()) {
      newErrors.gothram = 'Gothram is required';
    }
    if (!form.dateOfBirth.trim()) {
      newErrors.dateOfBirth = ERROR_REQUIRED.dateOfBirth[language];
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) {
      newErrors.dateOfBirth = ERROR_REQUIRED.dateOfBirthFormat[language];
    }
    if (!form.timeOfBirth.trim()) {
      newErrors.timeOfBirth = ERROR_REQUIRED.timeOfBirth[language];
    } else if (!/^\d{2}:\d{2}$/.test(form.timeOfBirth)) {
      newErrors.timeOfBirth = ERROR_REQUIRED.timeOfBirthFormat[language];
    }
    if (!form.locationName.trim()) {
      newErrors.locationName = ERROR_REQUIRED.locationName[language];
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      // Scroll to the first error
      const firstError = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Directly submit to parent handler; duplicate check is handled in NewHoroscope.tsx
    onSubmit(form);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glassmorphic p-6 rounded-2xl shadow-xl backdrop-blur-lg bg-white/30 border border-white/30">
      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Full Name">
          {LABELS.fullName[language]}
        </label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.fullName[language]}
          disabled={loading}
          className="glass-input"
        />
        {formSubmitted && errors.fullName && (
          <div className="text-red-400 text-sm mt-1">{errors.fullName}</div>
        )}
        {/* Duplicate error message */}
        {errors.fullName && !formSubmitted && (
          <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Gender">
          {LABELS.gender[language]}
        </label>
        <select
          name="gender"
          value={form.gender}
          onChange={e => handleChange(e as any)}
          disabled={loading}
          className="glass-input"
          aria-label={LABELS.gender[language]}
          title={LABELS.gender[language]}
        >
          <option value="">{PLACEHOLDERS.gender[language]}</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {formSubmitted && errors.gender && (
          <div className="text-red-400 text-sm mt-1">{ERROR_REQUIRED.gender ? ERROR_REQUIRED.gender[language] : errors.gender}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Father Name">
          {LABELS.fatherName[language]}
        </label>
        <input
          type="text"
          name="fatherName"
          value={form.fatherName}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.fatherName[language]}
          disabled={loading}
          className="glass-input"
          aria-label={LABELS.fatherName[language]}
          title={LABELS.fatherName[language]}
        />
        {formSubmitted && errors.fatherName && (
          <div className="text-red-400 text-sm mt-1">{errors.fatherName}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Family Name">
          {LABELS.familyName[language]}
        </label>
        <input
          type="text"
          name="familyName"
          value={form.familyName}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.familyName[language]}
          disabled={loading}
          className="glass-input"
          aria-label={LABELS.familyName[language]}
          title={LABELS.familyName[language]}
        />
        {formSubmitted && errors.familyName && (
          <div className="text-red-400 text-sm mt-1">{errors.familyName}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Gothram">
          {LABELS.gothram[language]}
        </label>
        <input
          type="text"
          name="gothram"
          value={form.gothram}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.gothram[language]}
          disabled={loading}
          className="glass-input"
          aria-label={LABELS.gothram[language]}
          title={LABELS.gothram[language]}
        />
        {formSubmitted && errors.gothram && (
          <div className="text-red-400 text-sm mt-1">{errors.gothram}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Date of Birth">
          {LABELS.dateOfBirth[language]}
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.dateOfBirth[language]}
          disabled={loading}
          className="glass-input"
          aria-label={LABELS.dateOfBirth[language]}
          title={LABELS.dateOfBirth[language]}
        />
        {formSubmitted && errors.dateOfBirth && (
          <div className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Time of Birth">
          {LABELS.timeOfBirth[language]}
        </label>
        <input
          type="time"
          name="timeOfBirth"
          value={form.timeOfBirth}
          onChange={handleChange}
          placeholder={PLACEHOLDERS.timeOfBirth[language]}
          disabled={loading}
          className="glass-input"
        />
        {formSubmitted && errors.timeOfBirth && (
          <div className="text-red-400 text-sm mt-1">{errors.timeOfBirth}</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Place of Birth">
          {LABELS.locationName[language]}
        </label>
        <LocationAutocomplete
          value={form.locationName}
          onChange={(value) => setForm(f => ({ ...f, locationName: value }))}
          onLocationSelect={handleLocationSelect}
          placeholder={PLACEHOLDERS.locationName[language]}
          disabled={loading}
          error={formSubmitted && errors.locationName ? errors.locationName : undefined}
          countryRestriction="in"
          types={['(cities)']}
          showCurrentLocation={true}
          className="mb-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              disabled={loading}
              className="glass-input w-full"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              disabled={loading}
              className="glass-input w-full"
              readOnly
            />
          </div>
        </div>
        {form.fullAddress && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Address</label>
            <div className="glass-input bg-gray-100 bg-opacity-20 text-gray-200 p-2 rounded text-sm">
              {form.fullAddress}
            </div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-purple-900 font-extrabold px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-yellow-400/50 disabled:opacity-60 disabled:cursor-not-allowed text-xl tracking-wide mt-4 border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        {loading ? 'Loading...' : 'Get Prediction'}
      </button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </form>
  );
};

export default BirthDataForm;
