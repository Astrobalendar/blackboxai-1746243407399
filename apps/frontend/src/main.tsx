import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PredictionTabs from "./components/PredictionTabs"; // Correct the path
import App from "./App";
import "./index.css"; // ✅ TailwindCSS

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/prediction/tabs" element={<PredictionTabs />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
