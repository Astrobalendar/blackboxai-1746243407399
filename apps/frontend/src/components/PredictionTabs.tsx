import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { auth } from "../firebase";
import { saveProfile, loadProfile } from "../lib/firebaseProfileService";
import RasiChart from "./charts/RasiChart";
import NavamsaChart from "./charts/NavamsaChart";
import PlanetExtChart from "./charts/PlanetExtChart";
import CuspalExtChart from "./charts/CuspalExtChart";
import BirthDataForm from "./BirthDataForm";

// Mock data for Dasha and Transit tabs
const mockDasha = [
  { period: "Moon-Mars", start: "2025-01-01", end: "2027-06-01" },
  { period: "Moon-Rahu", start: "2027-06-01", end: "2029-02-10" },
];

const mockTransit = [
  { planet: "Saturn", sign: "Aquarius", date: "2025-05-01" },
  { planet: "Jupiter", sign: "Taurus", date: "2025-06-20" },
];

// Placeholder components for new tabs
const DashaTab = () => (
  <div>
    <h3 className="text-lg font-bold mb-2">Dasha Periods</h3>
    <ul className="list-disc ml-6">
      {mockDasha.map((d, i) => (
        <li key={i}>
          {d.period}: {d.start} → {d.end}
        </li>
      ))}
    </ul>
  </div>
);

const TransitTab = () => (
  <div>
    <h3 className="text-lg font-bold mb-2">Current Transits</h3>
    <ul className="list-disc ml-6">
      {mockTransit.map((t, i) => (
        <li key={i}>
          {t.planet} in {t.sign} on {t.date}
        </li>
      ))}
    </ul>
  </div>
);

const generateMockChartData = () => {
  return {
    rasi: [
      { name: "Sun", house: 1 },
      { name: "Moon", house: 3 },
      { name: "Mars", house: 5 },
      { name: "Jupiter", house: 12 },
    ],
    navamsa: [
      { name: "Sun", house: 7 },
      { name: "Moon", house: 2 },
      { name: "Mars", house: 9 },
    ],
    planetExt: [
      { name: "Sun", degree: "12° Leo", house: 1 },
      { name: "Moon", degree: "03° Cancer", house: 11 },
      { name: "Mars", degree: "18° Aries", house: 5 },
      { name: "Mercury", degree: "27° Virgo", house: 2 },
      { name: "Jupiter", degree: "10° Sagittarius", house: 9 },
      { name: "Venus", degree: "14° Libra", house: 3 },
      { name: "Saturn", degree: "05° Capricorn", house: 7 },
      { name: "Rahu", degree: "20° Taurus", house: 10 },
      { name: "Ketu", degree: "20° Scorpio", house: 4 },
    ],
    cuspalExt: [
      { house: 1, sign: "Leo", ruler: "Sun" },
      { house: 2, sign: "Virgo", ruler: "Mercury" },
      { house: 3, sign: "Libra", ruler: "Venus" },
      { house: 4, sign: "Scorpio", ruler: "Mars" },
      { house: 5, sign: "Sagittarius", ruler: "Jupiter" },
      { house: 6, sign: "Capricorn", ruler: "Saturn" },
      { house: 7, sign: "Aquarius", ruler: "Saturn" },
      { house: 8, sign: "Pisces", ruler: "Jupiter" },
      { house: 9, sign: "Aries", ruler: "Mars" },
      { house: 10, sign: "Taurus", ruler: "Venus" },
      { house: 11, sign: "Gemini", ruler: "Mercury" },
      { house: 12, sign: "Cancer", ruler: "Moon" },
    ],
  };
};

const tabs = [
  "Birth Data",
  "Rasi/Navamsam",
  "Dasabukthi",
  "Significators",
  "Bava/Planet",
  "Cuspal Links",
  "Planet Ext",
  "Cuspal Ext 1",
  "Cuspal Ext 2",
  "Dasha",
  "Transit",
  "Full Chart",
];

type Branding = {
  logoUrl: string;
  headerText: string;
};

const branding: Branding = {
  logoUrl: "/logo.png", // Ensure logo.png is in the public folder or use a CDN URL
  headerText: "AstroBalendar Horoscope Report",
};

const exportToPDF = async (elementId: string, userName?: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

  // Add content to PDF
  pdf.addImage(imgData, "PNG", 10, 30, pageWidth - 20, imgHeight);

  // Footer with page numbers
  const pageCount = pdf.getNumberOfPages(); // Corrected method
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: "center" });
  }

// Watermark
    pdf.setTextColor(200);
    pdf.setFontSize(40);
    pdf.text("AstroBalendar", 70, 150, { angle: 45 });

    // Save PDF
  pdf.save(`horoscope-${userName || "report"}.pdf`);
};

const saveProfileToLocalStorage = (profile: any) => {
  const savedProfiles = JSON.parse(localStorage.getItem("horoscopeProfiles") || "[]");
  savedProfiles.push(profile);
  localStorage.setItem("horoscopeProfiles", JSON.stringify(savedProfiles));
};

const exportProfileAsJSON = (profile: any) => {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `horoscope-profile.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const predictionData: Record<string, any> = {}; // Initialize predictionData to resolve the error

const PredictionTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [birthData, setBirthData] = useState<any>(null);
  const [chartData, setChartData] = useState({
    rasi: [],
    navamsa: [],
    planetExt: [],
    cuspalExt: [],
    dasha: [],
    transit: [],
  }); // Holds chart data from backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUid(user.uid);
        const profile = await loadProfile();
        if (profile) {
          setBirthData(profile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://astrobalendar-backend.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to generate chart. Please try again.");
      }

      const data = await res.json();
      console.log("API Response:", data); // 🧪 Debugging API response

      setChartData({
        rasi: data.rasi || [],
        navamsa: data.navamsa || [],
        planetExt: data.planetExt || [],
        cuspalExt: data.cuspalExt || [],
        dasha: data.dasha || [],
        transit: data.transit || [],
      });
    } catch (err) {
      console.error("Chart generation failed:", err);
      setError("Failed to generate chart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!uid) return;
    try {
      await saveProfile(data);
      setBirthData(data);
      handleGenerate(data); // Generate chart data on form submission
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleSaveProfile = () => {
    if (currentProfile) {
      saveProfileToLocalStorage(currentProfile);
      alert("Profile saved successfully!");
    }
  };

  const handleExportProfile = () => {
    if (currentProfile) {
      exportProfileAsJSON(currentProfile);
    }
  };

  const handleExportPDF = () => {
    const elementId = "tab-content";
    exportToPDF(elementId, "John Doe");
  };

  const content: Record<string, JSX.Element> = {
    "Birth Data": <BirthDataForm onSubmit={handleFormSubmit} loading={loading} error={error} />,
    "Rasi/Navamsam": (
      <div id="tab-content" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {chartData.rasi.length ? (
          <>
            <div style={{ flex: "1 1 300px" }}>
              <RasiChart data={chartData?.rasi} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <NavamsaChart data={chartData?.navamsa} />
            </div>
          </>
        ) : (
          <p className="text-gray-500">No chart data yet. Please submit birth details.</p>
        )}
      </div>
    ),
    "Planet Ext": (
      <div id="tab-content">
        <PlanetExtChart data={chartData?.planetExt} />
      </div>
    ),
    "Cuspal Ext 1": (
      <div id="tab-content">
        <CuspalExtChart data={chartData?.cuspalExt} />
      </div>
    ),
    "Cuspal Ext 2": (
      <div id="tab-content">
        <CuspalExtChart data={chartData?.cuspalExt} />
      </div>
    ),
    "Dasha": <DashaTab />,
    "Transit": <TransitTab />,
    "Full Chart": (
      <pre>{JSON.stringify(chartData, null, 2)}</pre>
    ),
  };

  if (!birthData) {
    return <BirthDataForm onSubmit={handleFormSubmit} loading={loading} error={error} />;
  }

  return (
    <div className="p-4 bg-white rounded shadow mt-6 text-black">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveProfile}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Profile
          </button>
          <button
            onClick={handleExportProfile}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export PDF
          </button>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="text-sm">
        {!loading && !chartData.rasi.length && (
          <p className="text-gray-500">No chart data yet. Please submit birth details.</p>
        )}
        {loading && <p className="text-blue-500">Generating chart...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {content[activeTab]}
      </div>
    </div>
  );
};

export default PredictionTabs;
