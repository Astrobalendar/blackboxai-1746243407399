import './index.css';
import './styles/tabs.css';
import './styles/theme.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Debugging: Log when the script starts
console.log('main.tsx: Script started');

// Debugging: Check if React is loaded
console.log('main.tsx: React version', React.version);

// Get or create root element
let rootElement = document.getElementById('root');

if (!rootElement) {
  console.log('main.tsx: Creating root element');
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

// Ensure TypeScript knows rootElement is not null
const container = rootElement as HTMLElement;

// Render the app
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('main.tsx: App rendered successfully');
