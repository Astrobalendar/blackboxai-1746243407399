import React, { useState, useEffect } from "react";
import { isValidDate, formatDate } from "@/utils/dateUtils";
import { locationData } from "@/lib/locationData";
import { FaSpinner, FaInfoCircle } from "react-icons/fa";

const STATES = Object.keys(locationData.India);
const ROLES = ["Astrologer", "Student", "Client"];

const getLocalStorage = (key: string, fallback: any) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

type Props = {
  showRole?: boolean;
  onSubmit?: (data: any) => void;
};

const BirthDataForm: React.FC<Props> = ({ showRole = false, onSubmit }) => {
  // Form state
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    timeOfBirth: "",
    country: "India",
    state: "",
    district: "",
    city: "",
    role: "",
  });

  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [placesError, setPlacesError] = useState(false);

  // Prefill from localStorage
  useEffect(() => {
    const lastLocation = getLocalStorage("astrobalendar_last_location", {});
    setForm((f) => ({
      ...f,
      ...lastLocation,
      country: "India",
    }));
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (form.state && locationData.India[form.state]) {
      setDistricts(Object.keys(locationData.India[form.state]));
    } else {
      setDistricts([]);
    }
    setForm((f) => ({ ...f, district: "", city: "" }));
  }, [form.state]);

  // Update cities when district changes
  useEffect(() => {
    if (form.state && form.district && locationData.India[form.state]?.[form.district]) {
      setCities(locationData.India[form.state][form.district]);
    } else {
      setCities([]);
    }
    setForm((f) => ({ ...f, city: "" }));
  }, [form.district, form.state]);

  // Validation
  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required.";
    if (!form.timeOfBirth) errs.timeOfBirth = "Time of birth is required.";
    if (!form.state) errs.state = "State is required.";
    if (!form.city) errs.city = "City is required.";
    if (showRole && !form.role) errs.role = "Role is required.";
    // Date/time validation
    if (form.dateOfBirth && form.timeOfBirth) {
      const dt = new Date(`${form.dateOfBirth}T${form.timeOfBirth}:00`);
      if (!isValidDate(dt)) errs.timeOfBirth = "Invalid date or time.";
    }
    return errs;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: "" }));
    if (["state", "district"].includes(name)) {
      setForm((f) => ({ ...f, city: "" }));
    }
  };

  // Google Places Autocomplete (fallback to static)
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, city: e.target.value }));
    setErrors((errs) => ({ ...errs, city: "" }));
  };

  // Simulate Google Places Autocomplete (replace with real API as needed)
  const renderCityInput = () => {
    if (placesError || cities.length > 0) {
      return (
        <select
          name="city"
          value={form.city}
          onChange={handleCityChange}
          className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
          aria-label="City/Town/Village"
        >
          <option value="">Select city/town/village</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    }
    // Fallback: simple input
    return (
      <input
        type="text"
        name="city"
        value={form.city}
        onChange={handleCityChange}
        className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
        placeholder="Enter city/town/village"
        aria-label="City/Town/Village"
      />
    );
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    // Save location to localStorage
    setLocalStorage("astrobalendar_last_location", {
      state: form.state,
      district: form.district,
      city: form.city,
    });
    // Simulate async
    setTimeout(() => {
      setLoading(false);
      if (onSubmit) onSubmit(form);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 py-8 px-2">
      <form
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
        onSubmit={handleSubmit}
        aria-label="Birth Data Form"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Enter Birth Details</h2>
        <p className="text-center text-gray-500 mb-6">Please provide accurate birth information for best predictions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block uppercase tracking-wide font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <div className="text-red-500 text-xs mt-1">{errors.fullName}</div>}
          </div>
          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block uppercase tracking-wide font-medium mb-1">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
              value={form.dateOfBirth}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.dateOfBirth}
              pattern="\d{4}-\d{2}-\d{2}"
              placeholder="DD/MM/YYYY"
            />
            {errors.dateOfBirth && <div className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</div>}
          </div>
          {/* Time of Birth */}
          <div>
            <label htmlFor="timeOfBirth" className="block uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
              Time of Birth
              <span className="ml-1" tabIndex={0} aria-label="Time format: 24-hour">
                <FaInfoCircle className="inline text-gray-400" title="Time format: 24-hour (HH:mm)" />
              </span>
            </label>
            <input
              id="timeOfBirth"
              name="timeOfBirth"
              type="time"
              className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
              value={form.timeOfBirth}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.timeOfBirth}
              pattern="[0-9]{2}:[0-9]{2}"
              placeholder="HH:mm"
            />
            {errors.timeOfBirth && <div className="text-red-500 text-xs mt-1">{errors.timeOfBirth}</div>}
          </div>
          {/* Country */}
          <div>
            <label htmlFor="country" className="block uppercase tracking-wide font-medium mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
              value={form.country}
              disabled
              aria-label="Country"
            >
              <option value="India">India</option>
            </select>
          </div>
          {/* State */}
          <div>
            <label htmlFor="state" className="block uppercase tracking-wide font-medium mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
              value={form.state}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.state}
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <div className="text-red-500 text-xs mt-1">{errors.state}</div>}
          </div>
          {/* District */}
          <div>
            <label htmlFor="district" className="block uppercase tracking-wide font-medium mb-1">
              District <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <select
              id="district"
              name="district"
              className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
              value={form.district}
              onChange={handleChange}
              aria-label="District"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {/* City/Town/Village */}
          <div>
            <label htmlFor="city" className="block uppercase tracking-wide font-medium mb-1">
              City/Town/Village
            </label>
            {renderCityInput()}
            {placesError && (
              <div className="text-yellow-600 text-xs mt-1">
                Google Places unavailable. Using static city list.
              </div>
            )}
            {errors.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
          </div>
          {/* Role (Signup only) */}
          {showRole && (
            <div>
              <label htmlFor="role" className="block uppercase tracking-wide font-medium mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="rounded-xl border px-3 py-2 w-full focus:ring-primary"
                value={form.role}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!errors.role}
              >
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && <div className="text-red-500 text-xs mt-1">{errors.role}</div>}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-yellow-900 font-bold text-lg shadow-md hover:from-yellow-500 hover:to-yellow-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : null}
          Get Prediction
        </button>
      </form>
    </div>
  );
};

export default BirthDataForm;