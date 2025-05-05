import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function getCalendarEvents() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/calendar/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

export async function getPredictionByDate(date: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/calendar/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction by date:', error);
    return null;
  }
}

export async function downloadPredictionPdf(predictionId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/kp-chart/pdf/${predictionId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prediction_${predictionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
}
