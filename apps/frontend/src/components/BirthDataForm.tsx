import React, { useState } from 'react';
interface BirthDataFormProps {
  onSubmit: (data: {
    fullName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    locationName: string;
  }) => void;
  loading: boolean;
  error: string | null;
  initialData?: {
    fullName?: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    locationName?: string;
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

const BirthDataForm: React.FC<BirthDataFormProps> = ({
  onSubmit,
  loading,
  error,
  initialData,
  language = 'en',
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    timeOfBirth: initialData?.timeOfBirth || '',
    locationName: initialData?.locationName || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = ERROR_REQUIRED.fullName[language];
    }
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = ERROR_REQUIRED.dateOfBirth[language];
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = ERROR_REQUIRED.dateOfBirthFormat[language];
    }
    if (!formData.timeOfBirth.trim()) {
      newErrors.timeOfBirth = ERROR_REQUIRED.timeOfBirth[language];
    } else if (!/^\d{2}:\d{2}$/.test(formData.timeOfBirth)) {
      newErrors.timeOfBirth = ERROR_REQUIRED.timeOfBirthFormat[language];
    }
    if (!formData.locationName.trim()) {
      newErrors.locationName = ERROR_REQUIRED.locationName[language];
    }
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(formData);
  };

  return (
    <form
      className="max-w-xl mx-auto mt-12 mb-12 bg-gradient-to-br from-purple-950/90 to-purple-900/80 rounded-3xl shadow-2xl p-10 space-y-10 border border-purple-800 backdrop-blur-lg font-[system-ui,sans-serif]"
      onSubmit={handleSubmit}
      aria-label="Birth Data Form"
      title="Birth Data Form"
    >
      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Full Name">
          {LABELS.fullName[language]}
        </label>
        <input
          type="text"
          name="fullName"
          placeholder={PLACEHOLDERS.fullName[language]}
          value={formData.fullName}
          onChange={handleInputChange}
          className="w-full rounded px-3 py-2 text-lg bg-purple-800 text-white border border-purple-500 focus:outline-none"
          required
        />
        <div className={formSubmitted && errors.fullName ? "text-red-400 text-sm mt-1" : "invisible text-red-400 text-sm mt-1"}>
          {errors.fullName || 'Full name is required'}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-white text-lg font-bold tracking-wide" title="Date of Birth">
          {LABELS.dateOfBirth[language]}
        </label>
        <input
          type="date"
          name="dateOfBirth"
          placeholder={PLACEHOLDERS.dateOfBirth[language]}
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          className="w-full rounded px-3 py-2 text-lg bg-purple-800 text-white border border-purple-500 focus:outline-none"
          required
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
          placeholder={PLACEHOLDERS.timeOfBirth[language]}
          value={formData.timeOfBirth}
          onChange={handleInputChange}
          className="w-full rounded px-3 py-2 text-lg bg-purple-800 text-white border border-purple-500 focus:outline-none"
          required
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
          placeholder={PLACEHOLDERS.locationName[language]}
          value={formData.locationName}
          onChange={handleInputChange}
          className="w-full rounded px-3 py-2 text-lg bg-purple-800 text-white border border-purple-500 focus:outline-none"
          required
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
