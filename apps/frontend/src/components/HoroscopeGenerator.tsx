import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Function to calculate zodiac sign based on birthdate
const getZodiacSign = (date: string): string => {
  const zodiacDates = [
    { sign: 'Capricorn', start: '01-01', end: '01-19' },
    { sign: 'Aquarius', start: '01-20', end: '02-18' },
    { sign: 'Pisces', start: '02-19', end: '03-20' },
    { sign: 'Aries', start: '03-21', end: '04-19' },
    { sign: 'Taurus', start: '04-20', end: '05-20' },
    { sign: 'Gemini', start: '05-21', end: '06-20' },
    { sign: 'Cancer', start: '06-21', end: '07-22' },
    { sign: 'Leo', start: '07-23', end: '08-22' },
    { sign: 'Virgo', start: '08-23', end: '09-22' },
    { sign: 'Libra', start: '09-23', end: '10-22' },
    { sign: 'Scorpio', start: '10-23', end: '11-21' },
    { sign: 'Sagittarius', start: '11-22', end: '12-21' },
    { sign: 'Capricorn', start: '12-22', end: '12-31' },
  ];

  const [year, month, day] = date.split('-');
  const formattedDate = `${month}-${day}`;

  for (const zodiac of zodiacDates) {
    if (formattedDate >= zodiac.start && formattedDate <= zodiac.end) {
      return zodiac.sign;
    }
  }
  return '';
};

const mockHoroscopes: Record<string, Record<string, string>> = {
  en: {
    Aries: "Today brings clarity and a spark of energy.",
    Taurus: "Focus on your foundations. Comfort is key.",
    Gemini: "New ideas come effortlessly today.",
    Cancer: "Emotional insight opens up healing.",
    Leo: "Step into the spotlight — it’s your time.",
    Virgo: "Details matter, but don’t get lost in them.",
    Libra: "Seek balance in both thought and action.",
    Scorpio: "Intuition is strong. Trust your instincts.",
    Sagittarius: "Adventure and growth align today.",
    Capricorn: "Hard work pays off — keep climbing.",
    Aquarius: "Unconventional ideas inspire others.",
    Pisces: "Dream big, but stay grounded in emotion."
  },
  hi: {
    Aries: "आज स्पष्टता और ऊर्जा का संचार होगा।",
    Taurus: "अपनी नींव पर ध्यान दें। आराम महत्वपूर्ण है।",
    Gemini: "आज नए विचार आसानी से आएंगे।",
    Cancer: "भावनात्मक अंतर्दृष्टि से उपचार होगा।",
    Leo: "स्पॉटलाइट में कदम रखें — यह आपका समय है।",
    Virgo: "विवरण महत्वपूर्ण हैं, लेकिन उनमें खो न जाएं।",
    Libra: "सोच और क्रिया में संतुलन खोजें।",
    Scorpio: "अंतर्ज्ञान मजबूत है। अपनी प्रवृत्ति पर भरोसा करें।",
    Sagittarius: "आज साहस और विकास का मेल होगा।",
    Capricorn: "कड़ी मेहनत का फल मिलेगा — चढ़ाई जारी रखें।",
    Aquarius: "अप्रचलित विचार दूसरों को प्रेरित करते हैं।",
    Pisces: "बड़े सपने देखें, लेकिन भावनाओं में स्थिर रहें।"
  },
  ta: {
    Aries: "இன்று உங்கள் முயற்சிகள் வெற்றியடையும். நம்பிக்கையுடன் செயல்படுங்கள்.",
    Taurus: "உறுதி மற்றும் அமைதியுடன் உங்கள் பணிகளை முன்னெடுக்குங்கள்.",
    Gemini: "புதிய தகவல்கள் மற்றும் வாய்ப்புகள் உங்கள் எதிர்பார்ப்புகளை மீறலாம்.",
    Cancer: "உங்கள் குடும்பம் மற்றும் உணர்வுகளை முன்னிலைப்படுத்த வேண்டிய நாள்.",
    Leo: "வாய்ப்புகளைப் பயன்படுத்துங்கள் — மற்றவர்கள் உங்களைப் பார்க்கின்றனர்.",
    Virgo: "அறிமுகமான விஷயங்களில் கூட விவரம் முக்கியம் ஆகிறது.",
    Libra: "இன்றைய நாள் சமநிலையை தேவைப்படுத்தும். சுயநலத்துடன் செயல்பட வேண்டாம்.",
    Scorpio: "உங்கள் உள்ளுணர்வுகள் இன்று நன்கு செயல்படுகின்றன.",
    Sagittarius: "உங்கள் சுதந்திர உணர்வை அனுபவிக்க சிறந்த நாள்.",
    Capricorn: "முன்னேற்றத்திற்கு கடுமையாக உழைக்க வேண்டிய நாள்.",
    Aquarius: "புதிய யோசனைகள் இன்று உண்மையில் பயனளிக்கும்.",
    Pisces: "கலாதிறம்கள் வெளிப்படும் நாள். உங்கள் கனவுகளை நாடுங்கள்."
  }
};

interface HistoryEntry {
  date: string;
  sign: string;
  horoscope: string;
  timestamp: string;
}

interface HoroscopeGeneratorProps {
  birthDate?: string;
  sign?: string;
  fullName?: string;
}

const HoroscopeGenerator: React.FC<HoroscopeGeneratorProps> = ({ 
  birthDate: initialDate = '',
  sign: initialSign = '',
  fullName = ''
}) => {
  const [date, setDate] = useState<string>(initialDate || '');
  const [sign, setSign] = useState<string>(initialSign || '');
  const [horoscope, setHoroscope] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true); // Added state for toggling history panel

  useEffect(() => {
    // Load saved preferences and history from local storage
    const savedDate = localStorage.getItem('horoscopeDate');
    const savedSign = localStorage.getItem('horoscopeSign');
    const savedLanguage = localStorage.getItem('horoscopeLanguage');
    const savedHistory = localStorage.getItem('horoscopeHistory');

    if (savedDate) setDate(savedDate);
    if (savedSign) setSign(savedSign);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    // Save preferences to local storage
    localStorage.setItem('horoscopeDate', date);
    localStorage.setItem('horoscopeSign', sign);
    localStorage.setItem('horoscopeLanguage', language);
  }, [date, sign, language]);

  useEffect(() => {
    // Save history to local storage
    localStorage.setItem('horoscopeHistory', JSON.stringify(history));
  }, [history]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    if (!initialSign) {
      const calculatedSign = getZodiacSign(selectedDate);
      setSign(calculatedSign);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // Update sign when initialSign prop changes
  useEffect(() => {
    if (initialSign) {
      setSign(initialSign);
    }
  }, [initialSign]);

  // Update date when initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      if (!initialSign) {
        const calculatedSign = getZodiacSign(initialDate);
        setSign(calculatedSign);
      }
    }
  }, [initialDate, initialSign]);

  const fetchHoroscope = async () => {
    setLoading(true);
    setError('');
    setHoroscope('');
    try {
      const response = await axios.get(`/horoscope`, {
        params: { date, sign },
      });
      const fetchedHoroscope = response.data.horoscope;
      setHoroscope(fetchedHoroscope);
      addToHistory(fetchedHoroscope);
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      setError('⚠️ Could not reach the server. Showing mock data.');
      const fallbackHoroscope = mockHoroscopes[language][sign] || '✨ You are aligned with the cosmos.';
      setHoroscope(fallbackHoroscope);
      addToHistory(fallbackHoroscope);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (horoscope: string) => {
    const timestamp = new Date().toISOString();
    const newEntry = { date, sign, horoscope, timestamp };
    const updatedHistory = [newEntry, ...history].filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    });
    setHistory(updatedHistory);
  };

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  return (
    <div className="w-full">
      {!initialDate && !initialSign && (
        <h2 className="text-2xl font-bold mb-4">Horoscope Generator</h2>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          {!initialDate && (
            <label className="block mb-2">
              Date:
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-full p-2 border rounded"
              />
            </label>
          )}
          <label className="block mb-2">
            Zodiac Sign:
            <input
              type="text"
              placeholder="e.g., Aries"
              value={sign}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </label>
          {initialDate && initialSign && fullName && (
            <p className="text-sm text-muted-foreground mb-4">
              Horoscope for {fullName} ({sign}) born on {new Date(initialDate).toLocaleDateString()}
            </p>
          )}
          <label className="block mb-4">
            Language:
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full p-2 border rounded"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
            </select>
          </label>
          <button
            onClick={fetchHoroscope}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
            disabled={!date || !sign}
          >
            {loading ? 'Loading...' : 'Get Horoscope'}
          </button>
        </div>
        <div className="flex-1">
          {loading && <p className="text-blue-500">🔄 Loading your horoscope...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {horoscope && !loading && <p className="mt-4 p-4 border rounded bg-gray-50">{horoscope}</p>}
        </div>
      </div>

      {!initialDate && !initialSign && (
        <div className="history-panel mt-8">
          <h3 className="text-xl font-semibold mb-2">
            Prediction History (Last 7 Days)
            <button
              onClick={toggleHistory}
              className="ml-4 text-sm text-blue-500 underline"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </h3>
          {showHistory && (
            history.length === 0 ? (
              <p className="text-gray-500">No history available.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((entry, index) => (
                  <li key={index} className="p-2 border rounded bg-gray-50">
                    <strong>{entry.date} ({entry.sign}):</strong> {entry.horoscope}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HoroscopeGenerator;