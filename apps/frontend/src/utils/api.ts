import { User } from '../context/AuthProvider';

export const fetchPrediction = async (formData: any, user?: User, userRole?: string) => {
  try {
    const payload = {
      ...formData,
      user_id: user?.uid,
      role: userRole,
      display_name: user?.displayName,
    };
    const response = await fetch("https://astrobalendar-backend.onrender.com/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to fetch prediction");
    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
