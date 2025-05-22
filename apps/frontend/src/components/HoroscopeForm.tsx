/// <reference lib="dom" />
import React, { useState } from 'react';

import type { HoroscopeInput } from '@/shared/types/prediction';

interface HoroscopeFormProps {
  onSubmit: () => void;
  loading?: boolean;
}

const LAGNA_OPTIONS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];
const NAKSHATRA_OPTIONS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshta',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const HoroscopeForm: React.FC<HoroscopeFormProps> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState<HoroscopeInput>({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    place: '',
    lagna: '',
    nakshatra: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-1 font-medium">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
          placeholder="Enter your full name"
          title="Enter your full name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="YYYY-MM-DD"
            title="Enter your date of birth"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="timeOfBirth">Time of Birth</label>
          <input
            id="timeOfBirth"
            name="timeOfBirth"
            type="time"
            value={form.timeOfBirth}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="HH:MM"
            title="Enter your time of birth"
          />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium" htmlFor="place">Place</label>
        <input
          id="place"
          type="text"
          name="place"
          value={form.place}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
          placeholder="Enter your place of birth"
          title="Enter your place of birth"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium" htmlFor="lagna">Lagna</label>
          <select
            id="lagna"
            name="lagna"
            value={form.lagna}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            title="Select your Lagna (Ascendant)"
            aria-label="Lagna"
          >
            <option value="">Select Lagna</option>
            {LAGNA_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="nakshatra">Nakshatra</label>
          <select
            id="nakshatra"
            name="nakshatra"
            value={form.nakshatra}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            title="Select your Nakshatra"
            aria-label="Nakshatra"
          >
            <option value="">Select Nakshatra</option>
            {NAKSHATRA_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Get Prediction'}
      </button>
    </form>
  );
};

export default HoroscopeForm;
