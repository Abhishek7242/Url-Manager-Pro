import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import UrlState from "./context/url_manager/UrlState.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UrlState>
        <App />
      </UrlState>
    </BrowserRouter>
  </StrictMode>
);
