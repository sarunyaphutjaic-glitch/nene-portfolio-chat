import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { applyTheme, readTheme } from "./theme.js";

applyTheme(readTheme()); // ตั้งธีมก่อนแสดงผล จะได้ไม่กะพริบ

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
