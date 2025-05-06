import React, { useState } from "react";
import jsPDF from "jspdf";

type HoroscopeData = {
  name: string;
  date: string;
  time: string;
  location: string;
};

const NewHoroscope = () => {
  const [formData, setFormData] = useState<HoroscopeData>({
    name: "",
    date: "",
    time: "",
    location: "",
  });

  const [result, setResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://astrobalendar-backend.onrender.com/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          time: formData.time,
          place: formData.location,
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("⚠️ Error fetching prediction.");
    }
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Horoscope Report", 10, 10);
    doc.text(`Name: ${formData.name}`, 10, 20);
    doc.text(`Date: ${formData.date}`, 10, 30);
    doc.text(`Time: ${formData.time}`, 10, 40);
    doc.text(`Location: ${formData.location}`, 10, 50);
    doc.text("Prediction Result:", 10, 60);
    doc.text(result || "No result", 10, 70);
    doc.save("horoscope.pdf");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-semibold mb-4">Create New Horoscope</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full Name" onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        <input name="date" type="date" onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        <input name="time" type="time" onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        <input name="location" placeholder="City, Country" onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full hover:bg-purple-700">Get Horoscope</button>
      </form>
      {result && (
        <>
          <pre className="mt-6 bg-gray-100 p-4 rounded text-sm overflow-x-auto">{result}</pre>
          <button onClick={handleExport} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Export as PDF
          </button>
        </>
      )}
    </div>
  );
};

export default NewHoroscope;
