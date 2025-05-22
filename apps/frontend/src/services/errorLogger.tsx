/// <reference lib="dom" />
/// <reference types="node" />

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';


export const logError = async (
  error: Error | string,
  metadata?: {
    userId?: string;
    data?: any;
    context?: string;
  }
) => {
  try {
    await axios.post(`${API_URL}/api/errors`, {
      timestamp: new Date().toISOString(),
      error: {
        message: typeof error === 'string' ? error : error.message,
        name: typeof error !== 'string' ? error.name : undefined,
        stack: typeof error !== 'string' ? error.stack : undefined,
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



export const enableDebugMode = () => {
  localStorage.setItem('debugMode', 'true');
};

export const disableDebugMode = () => {
  localStorage.setItem('debugMode', 'false');
};

export const isDebug = () => {
  return localStorage.getItem('debugMode') === 'true';
};
