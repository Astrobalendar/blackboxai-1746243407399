import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized
        console.error('Unauthorized access - please log in');
      } else if (error.response.status === 403) {
        // Handle forbidden
        console.error('You do not have permission to access this resource');
      } else if (error.response.status === 404) {
        // Handle not found
        console.error('The requested resource was not found');
      } else if (error.response.status >= 500) {
        // Handle server errors
        console.error('A server error occurred. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up the request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
