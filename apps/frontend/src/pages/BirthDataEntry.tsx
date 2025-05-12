import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormText } from 'react-bootstrap';
import { auth, db } from '../firebase';
import styles from './BirthDataEntry.module.css';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';



// Google Maps libraries constant for LoadScript (prevents reload warning)
const GOOGLE_MAPS_LIBRARIES = ["places"];

import { useAuth } from '../context/AuthProvider';
import { useBirthData } from '../context/BirthDataContext';

const BirthDataEntry: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const { birthDataComplete, loading: birthDataLoading } = useBirthData();
  const [form, setForm] = useState({
    fullName: user?.displayName || '', 
    gender: '',
    dob: '', // DD/MM/YYYY
    tob: '',
    pob: '', // Place of Birth, required
    latitude: '',
    longitude: '',
    mobile: '',
    email: user?.email || '',
    address: '',
  });

  // Google Places Autocomplete ref
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);


  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // After successful submit, redirect to dashboard
  const handleSuccessRedirect = () => {
    if (userRole === 'astrologer') navigate('/dashboard/astrologer');
    else if (userRole === 'student') navigate('/dashboard/student');
    else navigate('/dashboard/client');
  };

  // Handle select changes for dropdowns
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Strict redirect logic: never show this page if user is not logged in or birth data is complete
  useEffect(() => {
    if (loading || birthDataLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (birthDataComplete) {
      if (userRole === 'astrologer') navigate('/dashboard/astrologer');
      else if (userRole === 'student') navigate('/dashboard/student');
      else navigate('/dashboard/client');
    }
  }, [user, userRole, loading, birthDataLoading, birthDataComplete, navigate]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({ ...prev, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  // Google Places Autocomplete integration for POB
  const handleAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {

  // Update your form submission logic to call handleSuccessRedirect after successful Firestore save
  // Example (you may need to adapt to your actual submit handler):
  // await setDoc(...)
  // handleSuccessRedirect();

    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (
        place &&
        place.geometry &&
        place.geometry.location &&
        typeof place.geometry.location.lat === 'function' &&
        typeof place.geometry.location.lng === 'function'
      ) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        if (lat !== undefined && lng !== undefined) {
          setForm((prev) => ({
            ...prev,
            pob: place.formatted_address || place.name || '',
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
        }
      }
    }
  };

  // Helper: Validate DD/MM/YYYY
  const validateDate = (date: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;
    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setError('');
    e.preventDefault();
    setError('');

    // Validation
    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.dob.trim() || !validateDate(form.dob.trim())) {
      setError('Date of birth is required and must be in DD/MM/YYYY format.');
      return;
    }
    if (!form.tob.trim()) {
      setError('Time of birth is required.');
      return;
    }
    if (!form.pob.trim()) {
      setError('Place of birth is required.');
      return;
    }
    setFormLoading(true);
    try {
      await setDoc(doc(db, 'birthdata', user!.uid), {
        fullName: form.fullName,
        gender: form.gender,
        dob: form.dob, // Always DD/MM/YYYY
        tob: form.tob,
        pob: form.pob,
        latitude: form.latitude,
        longitude: form.longitude,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        uid: user!.uid,
        createdAt: new Date().toISOString(),
      });
      // Mark user as verified in Firestore after saving birth data
      await setDoc(doc(db, 'users', user!.uid), { verified: true }, { merge: true });
      // Redirect to dashboard after successful birth data entry
      if (userRole === 'astrologer') navigate('/dashboard/astrologer');
      else if (userRole === 'student') navigate('/dashboard/student');
      else navigate('/dashboard/client');
    } catch (err: any) {
      setError('Failed to save birth data.');
    }
    setFormLoading(false);
  };

  const GOOGLE_MAPS_API_KEY = (import.meta.env as ImportMetaEnv).VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <h2 className={styles.title}>Enter Your Birth Data</h2>
        {GOOGLE_MAPS_API_KEY ? (
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={['places']}
            onLoad={() => setScriptLoaded(true)}
          >
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Personal Details Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Personal Details</h3>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="fullName">Full Name<span className={styles.error}>*</span></label>
                  <input id="fullName" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} required className={styles.input} />
                  <FormText className={styles.formText}>Please enter your full name</FormText>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="gender">Gender<span className={styles.error}>*</span></label>
                  <select id="gender" name="gender" value={form.gender} onChange={handleChange} required className={styles.select}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              {/* Birth Details Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Birth Details</h3>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="dob">Date of Birth<span className={styles.error}>*</span></label>
                  <DatePicker
  id="dob"
  name="dob"
  selected={form.dob ? dayjs(form.dob, 'DD/MM/YYYY').toDate() : null}
  onChange={date => setForm({ ...form, dob: date ? dayjs(date).format('DD/MM/YYYY') : '' })}
  dateFormat="dd/MM/yyyy"
  placeholderText="Select date of birth"
  className={styles.input}
  maxDate={new Date()}
  required
/>
<FormText className={styles.formText}>Select your date of birth</FormText>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="tob">Time of Birth<span className={styles.error}>*</span></label>
                  <DatePicker
  id="tob"
  name="tob"
  selected={form.tob ? dayjs(form.tob, 'HH:mm').toDate() : null}
  onChange={time => setForm({ ...form, tob: time ? dayjs(time).format('HH:mm') : '' })}
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={5}
  timeCaption="Time"
  dateFormat="HH:mm"
  placeholderText="Select time of birth"
  className={styles.input}
  required
/>
<FormText className={styles.formText}>Select your time of birth (24-hour, e.g., 16:30 for 4:30 PM)</FormText>
                </div>
                {/* Place of Birth (Google Autocomplete) */}
                <div className={styles.formGroup}>
                  <label className={styles.title}>Place of Birth</label>
                  {error && error.includes("Google Maps") ? (
                    <input
                      name="pob"
                      value={form.pob}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter place of birth manually"
                    />
                  ) : (
                    <Autocomplete
                      onLoad={handleAutocompleteLoad}
                      onPlaceChanged={handlePlaceChanged}
                    >
                      <input
                        name="pob"
                        value={form.pob}
                        onChange={handleChange}
                        required
                        placeholder="Enter place of birth (autocomplete)"
                        className={styles.input}
                      />
                    </Autocomplete>
                  )}
                </div>
                {/* Hidden fields for latitude and longitude, auto-filled by autocomplete */}
                <input type="hidden" name="latitude" value={form.latitude} readOnly />
                <input type="hidden" name="longitude" value={form.longitude} readOnly />
              </div>
              {/* Contact Information Section */}
              <div>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                {/* Mobile Number */}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="mobile">Mobile Number<span className={styles.error}>*</span></label>
                  <input id="mobile" name="mobile" placeholder="Enter your mobile number" value={form.mobile} onChange={handleChange} required maxLength={10} className={styles.input} />
                </div>
                {/* Email field (read-only) */}
                <input name="email" placeholder="Email" value={form.email} disabled readOnly className={styles.bg} />
                <label className={styles.label} htmlFor="address">Full Address<span className={styles.error}>*</span></label>
                <input id="address" name="address" placeholder="Enter your full address" value={form.address} onChange={handleChange} required className={styles.input} />
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <button type="submit" disabled={formLoading} className={styles.button}>Submit</button>
            </form>
          </LoadScript>
        ) : (
          <div>
            <div className={styles.sectionTitle}>Google Maps API Key is not set or is misconfigured.</div>
            <div className={styles.formGroup}>
              <label className={styles.title}>Place of Birth<span className={styles.error}>*</span></label>
              <input
                name="pob"
                value={form.pob}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter place of birth manually"
              />
            </div>
            {/* Hidden fields for latitude and longitude */}
            <input type="hidden" name="latitude" value={form.latitude} readOnly />
            <input type="hidden" name="longitude" value={form.longitude} readOnly />
            <button type="submit" disabled={formLoading} className={styles.button}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthDataEntry;
