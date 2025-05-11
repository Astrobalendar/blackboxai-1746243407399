import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';

// Google Maps libraries constant for LoadScript (prevents reload warning)
const GOOGLE_MAPS_LIBRARIES = ["places"];

const BirthDataEntry: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [form, setForm] = useState({
    fullName: user?.displayName || '', 
    gender: '',
    dob: '', 
    tob: '', 
    pob: '', 
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
  const [loading, setLoading] = useState(false);

  // Handle select changes for dropdowns
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
  };

  // Google Places Autocomplete integration for POB
  const handleAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        setForm((prev) => ({
          ...prev,
          pob: place.formatted_address || place.name || '',
          latitude: place.geometry.location.lat().toString(),
          longitude: place.geometry.location.lng().toString(),
        }));
      }
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // Ensure recaptchaVerifier is initialized only once
      // Ensure the recaptcha-container div exists
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      if (!window.confirmationResult) {
        setError('OTP not sent or expired. Please resend OTP.');
        setLoading(false);
        return;
      }
      await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
    } catch (err: any) {
      setError('Invalid OTP. Try again.');
    }
    setLoading(false);
  };


  const handleEmailVerification = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await user.sendEmailVerification();
      alert('Verification email sent. Please check your inbox.');
    } catch (err: any) {
      setError('Failed to send verification email.');
    }
    setLoading(false);
  };

  const checkEmailVerified = async () => {
    if (!user) return;
    await user.reload();
    setEmailVerified(user.emailVerified);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO: Email verification suspended. Re-enable this check when ready.
    // if (!emailVerified) {
    //   setError('Please verify your email address.');
    //   setLoading(false);
    //   return;
    // }
    try {
      await setDoc(doc(db, 'birthdata', user!.uid), {
        fullName: form.fullName,
        gender: form.gender,
        dob: form.dob,
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
      // Mark user as verified
      await setDoc(doc(db, 'users', user!.uid), { verified: true }, { merge: true });
      navigate('/dashboard/client');
    } catch (err: any) {
      setError('Failed to save birth data.');
    }
    setLoading(false);
  };

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-16 mb-12">
        <h2 className="text-2xl font-bold text-yellow-900 mb-6 text-center">Enter Your Birth Data</h2>
        {GOOGLE_MAPS_API_KEY ? (
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={GOOGLE_MAPS_LIBRARIES}
            onLoad={() => setScriptLoaded(true)}
          >
            <form onSubmit={handleSubmit}>
              {/* Personal Details Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-yellow-800">Personal Details</h3>
                <div className="mb-4">
                  <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
                </div>
                <div className="flex gap-4 mb-4">
                  <select name="gender" value={form.gender} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" title="Gender">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              {/* Birth Details Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-yellow-800">Birth Details</h3>
                <div className="flex gap-4 mb-4">
                  <input name="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
                  <input name="tob" type="time" placeholder="Time of Birth" value={form.tob} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
                </div>
                {/* Place of Birth (Google Autocomplete) */}
                <div className="mb-4">
                  <label className="block font-bold mb-2 text-yellow-800">Place of Birth</label>
                  {error && error.includes("Google Maps") ? (
                    <input
                      name="pob"
                      value={form.pob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500"
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
                        className="w-full px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500"
                        placeholder="Enter place of birth (autocomplete)"
                      />
                    </Autocomplete>
                  )}
                </div>
                {/* Hidden fields for latitude and longitude, auto-filled by autocomplete */}
                <input type="hidden" name="latitude" value={form.latitude} readOnly />
              </div>
              {/* Contact Information Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-yellow-800">Contact Information</h3>
                {/* Mobile Number */}
                <div className="flex gap-4 mb-4">
                  <input name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} required maxLength={10} className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
                </div>
                {/* Email field (read-only) */}
                <input name="email" placeholder="Email" value={form.email} disabled readOnly className="px-4 py-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 mb-4" />
                <input name="address" placeholder="Full Address" value={form.address} onChange={handleChange} required className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
              </div>
              {error && <div className="bg-red-100 text-red-800 rounded-lg px-4 py-3 text-center font-semibold">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow transition mt-2">Submit</button>
            </form>
          </LoadScript>
        ) : (
          <div>
            <div className="text-lg font-bold mb-4 text-yellow-800">Google Maps API Key is not set or is misconfigured.</div>
            <div className="mb-4">
              <label className="block font-bold mb-2 text-yellow-800">Place of Birth</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500"
                placeholder="Enter place of birth manually"
              />
            </div>
            {/* Hidden fields for latitude and longitude */}
            <input type="hidden" name="latitude" value={form.latitude} readOnly />
            <input type="hidden" name="longitude" value={form.longitude} readOnly />
            <button type="submit" disabled={loading || !otpVerified || !emailVerified} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow transition mt-2">Submit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthDataEntry;
