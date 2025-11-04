import React, { useState } from "react";
import "../CSS/Settings.css";
import { FiSettings, FiX } from "react-icons/fi";

import BackgroundSettings from "./BackgroundSettings";
import FeatureToggles from "./FeatureToggles";
import UrlContext from "../../context/url_manager/UrlContext";
import AnalogClock from "./AnalogClock";

const Settings = () => {
   const context = React.useContext(UrlContext);
   const {
     statsView,
     setStatsView,
     tagsView,
     setTagsView,
     urlsView,
     setUrlsView,
     openSettings,
     setSettingsOpen,
   } = context;
  const [activeTab, setActiveTab] = useState("Backgrounds");
  const [showBackground, setShowBackground] = useState(true);
  const [showAds, setShowAds] = useState(false);
  const [selectedBg, setSelectedBg] = useState("mountain");

  const tabs = [
    "Backgrounds",
    "Clock",
    "Cards",
  ];

  return (
    <>
      {/* <div
        className="fixed-settings"
        onClick={() => setSettingsOpen(!openSettings)}
        title="Settings"
      >
        <FiSettings />
      </div> */}
      {openSettings && (
        <div className="settings-root-container ">
          <div className="settings-container">
            <div className="settings-header">
              <h2>Settings</h2>

              {/* accessible round cut button */}
              <button
                className="round-cut-btn"
                aria-label="Cut / Close"
                title="Cut"
                onClick={() => setSettingsOpen(!openSettings)}
              >
                <FiX />
              </button>
            </div>
            <div className="settings-inner-container">
              <aside className="settings-sidebar">
                {tabs.map((tab) => (
                  <div
                    key={tab}
                    className={`sidebar-item ${
                      activeTab === tab ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </aside>

              <div className="settings-content">
                <h2>{activeTab}</h2>

                {activeTab === "Backgrounds" && (
                  <div className="settings-section">
                    {/* <div className="toggle-row">
                    <span>Show Background Images</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={showBackground}
                        onChange={() => setShowBackground(!showBackground)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div> */}

                    <BackgroundSettings />

                    {/* <div className="bg-footer">
                    <span>Use your own</span>
                    <span>Brave backgrounds</span>
                  </div> */}
                  </div>
                )}
                {activeTab === "Cards" && (
                  <div className="settings-section">
                    <FeatureToggles
                      setStatsView={setStatsView}
                      setTagsView={setTagsView}
                      setUrlsView={setUrlsView}
                    />
                  </div>
                )}
                {activeTab === "Clock" && (
                  <div className="settings-section">
                    <AnalogClock />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
