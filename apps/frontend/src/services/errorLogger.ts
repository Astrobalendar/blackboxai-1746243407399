import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface ErrorMetadata {
  userId?: string;
  data?: any;
  context?: string;
}

interface ErrorLog {
  timestamp: Date;
  errorType: string;
  errorMessage: string;
  userId?: string;
  requestPayload?: Record<string, any>;
  responsePayload?: Record<string, any>;
}

export const logError = async (error: Error, metadata?: ErrorMetadata) => {
  try {
    await axios.post(`${API_URL}/api/errors`, {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      metadata,
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Failed to log error:', error);
  }
};

let isDebugMode = false;

export const enableDebugMode = () => {
  localStorage.setItem('debugMode', 'true');
};

export const disableDebugMode = () => {
  localStorage.setItem('debugMode', 'false');
};

export const isDebug = () => {
  return localStorage.getItem('debugMode') === 'true';
};
