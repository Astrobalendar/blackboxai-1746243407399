import axios from "axios";

const OPEN_CAGE_API_KEY = "YOUR_API_KEY"; // Replace with your OpenCage API key

export const getLatLonFromCity = async (city: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
      params: {
        q: city,
        key: OPEN_CAGE_API_KEY,
      },
    });

    const { results } = response.data;
    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry;
      return { lat, lon: lng };
    }
    return null;
  } catch (error) {
    console.error("Error fetching location coordinates:", error);
    return null;
  }
};
