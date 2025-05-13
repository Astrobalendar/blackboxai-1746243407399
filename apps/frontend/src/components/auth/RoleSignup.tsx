import React, { useState } from 'react';

const RoleSignup = ({ onSignup }: { onSignup: (form: any) => void }) => {
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    tob: '',
    pob: '',
    gender: '',
    email: '',
    mobile: '',
    role: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(form);
  };

  return (
    <form className="max-w-lg mx-auto p-8 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input required name="fullName" placeholder="Full Name" className="input mb-2" onChange={handleChange} />
      <input required name="dob" placeholder="Date of Birth (YYYY-MM-DD)" className="input mb-2" onChange={handleChange} />
      <input required name="tob" placeholder="Time of Birth (HH:MM)" className="input mb-2" onChange={handleChange} />
      <input required name="pob" placeholder="Place of Birth" className="input mb-2" onChange={handleChange} />
      <input required name="gender" placeholder="Gender" className="input mb-2" onChange={handleChange} />
      <input required name="email" placeholder="Email" type="email" className="input mb-2" onChange={handleChange} />
      <input required name="mobile" placeholder="Mobile" className="input mb-2" onChange={handleChange} />
      <select required name="role" className="input mb-2" onChange={handleChange}>
        <option value="">Select Role</option>
        <option value="astrologer">Astrologer</option>
        <option value="client">Client</option>
        <option value="student">Student</option>
      </select>
      <input required name="password" type="password" placeholder="Password" className="input mb-2" onChange={handleChange} />
      <button type="submit" className="btn btn-primary w-full mt-4">Sign Up</button>
    </form>
  );
};

export default RoleSignup;
