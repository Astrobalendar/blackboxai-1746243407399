export const fetchPrediction = async (formData: any) => {
  try {
    const response = await fetch("https://astrobalendar-backend.onrender.com/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error("Failed to fetch prediction");
    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
