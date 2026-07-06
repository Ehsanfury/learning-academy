/**
 * main.jsx
 * Path: src/main.jsx
 * Description: Application entry point
 * Changes:
 * - ✅ Removed duplicate globals.css import (only in App.jsx)
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ❌ Remove this line - globals.css is imported in App.jsx
// import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);