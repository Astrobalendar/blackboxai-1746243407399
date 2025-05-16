import React, { useState } from 'react';
interface BirthDataFormProps {
  onSubmit: (data: {
    fullName: string;
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

import { useRef } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const BirthDataForm: React.FC<BirthDataFormProps> = ({
  onSubmit,
  loading,
  error,
  initialData,
  language = 'en',
}) => {
  const [form, setForm] = useState({
    fullName: initialData?.fullName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    timeOfBirth: initialData?.timeOfBirth || '',
    locationName: initialData?.locationName || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    fullAddress: initialData?.fullAddress || '',
  });

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { /* Define bounds or country if needed */ },
    debounce: 300,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    setForm(f => ({ ...f, locationName: address }));
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setForm(f => ({ ...f, latitude: lat.toString(), longitude: lng.toString(), fullAddress: results[0].formatted_address }));
    } catch (e) {
      // fallback
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
      });
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = ERROR_REQUIRED.fullName[language];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(f => ({ ...f, [name]: '' }));
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
        <input
          type="text"
          name="locationName"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={PLACEHOLDERS.locationName[language]}
          disabled={loading}
          className="glass-input"
          autoComplete="off"
        />
        {status === 'OK' && (
          <ul className="autocomplete-list">
            {data.map(({ description }, idx) => (
              <li key={idx} onClick={() => handleSelect(description)} className="autocomplete-item">
                {description}
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={handleGetLocation} className="glass-btn mt-2">Use My Location</button>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            disabled={loading}
            className="glass-input flex-1"
          />
          <input
            type="text"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            disabled={loading}
            className="glass-input flex-1"
          />
        </div>
        <input
          type="text"
          name="fullAddress"
          value={form.fullAddress}
          onChange={handleChange}
          placeholder="Full Address"
          disabled={loading}
          className="glass-input mt-2"
        />
        {formSubmitted && errors.locationName && (
          <div className="text-red-400 text-sm mt-1">{errors.locationName}</div>
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
