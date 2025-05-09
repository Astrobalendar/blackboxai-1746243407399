import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import posthog from 'posthog-js';

// posthog.init('PH_KEY', {
  // api_host: 'https://app.posthog.com',
  // autocapture: true,
  // disable_session_recording: false
// });
// To anonymize users, avoid calling posthog.identify()

import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PredictionTabs from "./components/PredictionTabs"; // Correct the path
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css"; // ✅ TailwindCSS

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/prediction/tabs" element={<PredictionTabs />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
