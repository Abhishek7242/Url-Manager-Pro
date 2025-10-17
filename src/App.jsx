// import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Reminders from "./components/Reminders";
import Storage from "./components/Storage";
import Analytics from "./components/Analytics";
import Signup from "./components/auth/Signup";
import VerifyOtp from "./components/auth/VerifyOtp";

import Login from "./components/auth/Login";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Duplicates from "./components/Duplicates";
import Suggestions from "./components/Suggestions";
import Tags from "./components/Tags";
import React, { useState } from "react";
import Notification from "./components/Notification";
import UrlContext from "./context/url_manager/UrlContext";
import AddTagsLinksModel from "./components/suggestion/AddTagsLinksModel";

function App() {
  const context = React.useContext(UrlContext);
  const {
    API_BASE,
    addUrl,
    getAllUrls,
    getUrlById,
    formData,
    setFormData,
    urls,
    setUrls,
    deleteUrlPost,
    archive,
    setArchive,
    notify,
    setNotify,
    showNotify,
  } = context;
  const handleExport = () => {
    const data = JSON.parse(localStorage.getItem("lynkr_urls") || "[]");
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lynkr_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        localStorage.setItem("lynkr_urls", JSON.stringify(data));
        alert("✅ URLs imported successfully!");
      } catch {
        alert("❌ Invalid JSON file!");
      }
    };
    reader.readAsText(file);
  };
  const location = useLocation();

  // paths where we DON'T want the navbar
  const noNavPaths = ["/signup", "/signup/verifyotp", "/login"]; // add more if needed
  const hideNavbar = noNavPaths.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="app">

        <div className="notify-container">
          {notify && (
            <Notification
              type={notify.type}
              message={notify.message}
              duration={4000}
              onClose={() => setNotify(null)}
            />
          )}
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/duplicates" element={<Duplicates />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/verifyotp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
