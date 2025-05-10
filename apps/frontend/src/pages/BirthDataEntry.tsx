import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const BirthDataEntry: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '', // Date of Birth
    tob: '', // Time of Birth
    mobile: '',
    email: user?.email || '',
    address: '',
    country: 'India',
    state: '',
    district: '',
    city: '',
    latitude: '',
    longitude: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
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

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
      }
      const confirmation = await signInWithPhoneNumber(auth, '+91' + form.mobile, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
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
    if (!otpVerified) {
      setError('Please verify your mobile number.');
      setLoading(false);
      return;
    }
    if (!emailVerified) {
      setError('Please verify your email address.');
      setLoading(false);
      return;
    }
    try {
      await setDoc(doc(db, 'birthdata', user!.uid), {
        ...form,
        uid: user!.uid,
        createdAt: new Date().toISOString(),
      });
      // Mark user as verified
      await setDoc(doc(db, 'users', user!.uid), { verified: true }, { merge: true });
      navigate(`/dashboard`);
    } catch (err: any) {
      setError('Failed to save birth data.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 py-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl py-10 px-6 md:px-10">
        <h2 className="text-3xl font-extrabold text-yellow-900 mb-8 text-center">Enter Your Birth Data</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Personal Details Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-800">Personal Details</h3>
            <div className="flex gap-4 mb-4">
              <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
              <input name="middleName" placeholder="Middle Name" value={form.middleName} onChange={handleChange} className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
              <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
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
            <div className="flex gap-4 mb-4">
              <div className="flex-1 flex flex-col">
                <label htmlFor="country" className="sr-only">Country</label>
                <select id="country" name="country" value={form.country} onChange={handleSelectChange} required className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" title="Country">
                  <option value="India">India</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <label htmlFor="state" className="sr-only">State</label>
                <select id="state" name="state" value={form.state} onChange={handleSelectChange} required className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" title="State">
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <label htmlFor="district" className="sr-only">District</label>
                <select id="district" name="district" value={form.district} onChange={handleSelectChange} required className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" title="District">
                  <option value="Ranipet">Ranipet</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <label htmlFor="city" className="sr-only">City</label>
                <select id="city" name="city" value={form.city} onChange={handleSelectChange} required className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" title="City">
                  <option value="Sholinghur">Sholinghur</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
              <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
            </div>
          </div>
          {/* Contact Information Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-yellow-800">Contact Information</h3>
            <div className="flex gap-4 mb-4">
              <input name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} required maxLength={10} className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
              {!otpVerified && (
                <div className="flex flex-col gap-2 flex-1">
                  {!otpSent ? (
                    <button type="button" disabled={loading} onClick={handleSendOtp} className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl shadow transition">Send OTP</button>
                  ) : (
                    <div className="flex gap-2">
                      <input name="otp" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required className="flex-1 px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
                      <button type="button" disabled={loading} onClick={handleVerifyOtp} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-4 rounded-xl shadow transition">Verify OTP</button>
                    </div>
                  )}
                  <div id="recaptcha-container"></div>
                </div>
              )}
            </div>
            <input name="email" placeholder="Email" value={form.email} disabled readOnly className="px-4 py-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 mb-4" />
            {!emailVerified && (
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={handleEmailVerification} disabled={loading} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl shadow transition">Send Email Verification</button>
                <button type="button" onClick={checkEmailVerified} disabled={loading} className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold py-3 rounded-xl shadow transition">I have verified my email</button>
              </div>
            )}
            <input name="address" placeholder="Full Address" value={form.address} onChange={handleChange} required className="px-4 py-3 rounded-lg border border-yellow-200 focus:outline-yellow-500" />
          </div>
          {error && <div className="bg-red-100 text-red-800 rounded-lg px-4 py-3 text-center font-semibold">{error}</div>}
          <button type="submit" disabled={loading || !otpVerified || !emailVerified} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow transition mt-2">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default BirthDataEntry;
