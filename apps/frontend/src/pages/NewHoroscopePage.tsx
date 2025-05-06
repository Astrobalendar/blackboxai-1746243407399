import React, { useState } from "react";
import HeaderNav from "../components/HeaderNav";
import NewHoroscope from "../components/NewHoroscope";
import HoroscopeView from "../components/HoroscopeView";

interface NewHoroscopePageProps {
  onPrediction: (data: any) => void; // Replace `any` with the appropriate type if available
}

const NewHoroscopePage: React.FC<NewHoroscopePageProps> = ({ onPrediction }) => {
  const [horoscopeData, setHoroscopeData] = useState(null);

  const handlePrediction = (data: any) => {
    setHoroscopeData(data);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderNav />
      <main className="flex-1 p-6">
        {!horoscopeData ? (
          <NewHoroscope onPrediction={handlePrediction} />
        ) : (
          <HoroscopeView data={horoscopeData} />
        )}
      </main>
    </div>
  );
};

export default NewHoroscopePage;
