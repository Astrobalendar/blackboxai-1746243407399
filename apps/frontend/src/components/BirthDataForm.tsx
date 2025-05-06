import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { getLatLonFromCity } from "../lib/geoService"; // Import OpenCage API service
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase"; // Import Firestore and Auth

declare module "html2pdf.js";

interface FormData {
  name: string;
  date: string;
  time: string;
  location: string;
  timeZone: string;
  ampm: string;
}

const BirthDataForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(() => {
    const savedData = localStorage.getItem("birthData");
    return savedData
      ? JSON.parse(savedData)
      : { name: "", date: "", time: "", location: "", timeZone: "UTC", ampm: "AM" };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const backend = process.env.REACT_APP_BACKEND_URL as string; // Ensure type safety

  useEffect(() => {
    const loadLastProfile = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const docRef = doc(db, "birthData", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFormData(docSnap.data() as FormData);
      }
    };

    loadLastProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem("birthData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev: FormData) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNow = () => {
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const docRef = doc(db, "birthData", userId);
        await setDoc(docRef, {
          ...formData,
          createdAt: serverTimestamp(),
        });
        console.log("Profile saved successfully.");
      }

      const response = await axios.post(`${backend}/api/predict`, {
        date: formData.date,
        time: `${formData.time} ${formData.ampm}`,
        place: formData.location,
      });
      console.log("Prediction Data:", response.data);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!pdfRef.current) return;

    const options = {
      margin: 1,
      filename: `${formData.name}_BirthData.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 }, // Ensure high-quality rendering
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(options).from(pdfRef.current).save();
  };

  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Birth Data Prediction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Your Name"
              required
            />
          </label>
        </div>
        <div>
          <label className="block mb-2">
            Date of Birth:
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </label>
        </div>
        <div>
          <label className="block mb-2">
            Time of Birth:
            <div className="flex gap-2">
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="ampm"
                value={formData.ampm}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </label>
        </div>
        <div>
          <label className="block mb-2">
            Place of Birth:
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., New York, USA"
              required
            />
          </label>
        </div>
        <div>
          <label className="block mb-2">
            Time Zone:
            <select
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="UTC">UTC</option>
              <option value="GMT">GMT</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="IST">IST</option>
              {/* Add more time zones as needed */}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNow}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Use Current Time
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Export PDF
          </button>
        </div>
        {loading && <p className="text-blue-500">Saving...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
      <div ref={pdfRef} className="hidden">
        {/* Hidden content for PDF generation */}
        <h2>Birth Data</h2>
        <p>Name: {formData.name}</p>
        <p>Date of Birth: {formData.date}</p>
        <p>Time of Birth: {formData.time} {formData.ampm}</p>
        <p>Location: {formData.location}</p>
        <p>Time Zone: {formData.timeZone}</p>
      </div>
    </div>
  );
};

export default BirthDataForm;