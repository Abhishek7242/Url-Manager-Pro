import React, { useEffect, useRef, useState } from "react";
import { FiDownload, FiUpload, FiDatabase, FiCloud, FiSave, FiLoader, FiX } from "react-icons/fi";
import "./CSS/Storage.css";
import UrlContext from "../context/url_manager/UrlContext";
import NeonOrbitalLoader from "./NeonOrbitalLoader";

export default function Storage({ items = [], onImportItems, onSaveToCloud }) {
  const [loading, setLoading] = useState(true);
  const [importedData, setImportedData] = useState(null);
  const [savingImport, setSavingImport] = useState(false);
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
    search,
    setSearch,
    filtered,
    showNotify,
    setScreenLoading,
  } = context;

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls();
        console.log("✅ API Response:", res.data);
        setUrls(res.data);
      } catch (err) {
        console.error("❌ Error fetching URLs:", err);
        showNotify("Error loading URLs", "error");
      } finally {
        setLoading(false);
        setScreenLoading(false)
      }
    };

    fetchUrls();
  }, []);

  const fileInputRef = useRef();

  function handleExport() {
    const data = JSON.stringify(filtered || [], null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lynkr_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setImportedData(json);
      } catch {
        showNotify("Invalid file format", "error");
      }
    };
    reader.readAsText(file);
  }

  const handleSaveImport = async () => {
    if (!importedData) return;
    
    setSavingImport(true);
    try {
      // Save each URL to the database
      for (const url of importedData) {
        await addUrl(url);
        const res = await getAllUrls();
        setUrls(res.data);
      }
      
      // Refresh the URL list
      
      // Clear the import preview
      setImportedData(null);
      showNotify("success",`Successfully imported ${importedData.length} URLs`);
    } catch (err) {
      console.error("Error saving imported data:", err);
      showNotify("Failed to save imported data", "error");
    } finally {
      setSavingImport(false);
    }
  };

  const cancelImport = () => {
    setImportedData(null);
    fileInputRef.current.value = "";
  };

  if (loading) {
    return (
        <NeonOrbitalLoader />
    );
  }

  return (
    <div className="storage-wrapper">
      {importedData ? (
        <div className="import-preview">
          <div className="preview-header">
            <h3>Import Preview</h3>
            <button className="close-btn" onClick={cancelImport}>
              <FiX />
            </button>
          </div>
          <div className="preview-content">
            <div className="preview-stats">
              <div className="stat-item">
                <span className="stat-label">URLs to import:</span>
                <span className="stat-value">{importedData.length}</span>
              </div>
            </div>
            <div className="preview-list">
              {importedData.slice(0, 5).map((url, index) => (
                <div key={index} className="preview-item">
                  <div className="preview-title">{url.title || 'Untitled'}</div>
                  <div className="preview-url">{url.url}</div>
                </div>
              ))}
              {importedData.length > 5 && (
                <div className="preview-more">
                  +{importedData.length - 5} more URLs...
                </div>
              )}
            </div>
          </div>
          <div className="preview-actions">
            <button className=" import-cancel-btn" onClick={cancelImport}>
              Cancel
            </button>
            <button 
              className="btn primary" 
              onClick={handleSaveImport}
              disabled={savingImport}
            >
              {savingImport ? (
                <>
                  <FiLoader className="spin-icon" /> Saving...
                </>
              ) : (
                <>
                  <FiSave /> Save to Database
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="storage-container">
          {/* Local Storage */}
          <div className="storage-card">
            <div className="storage-header">
              <FiDatabase className="storage-icon" />
              <h3>Local Storage</h3>
            </div>
            <p className="storage-desc">
              Export your URLs to a Excel file or import from a backup file.
            </p>

            <div className="storage-buttons">
              <button className="btn outline" onClick={handleExport}>
                <FiDownload /> Export
              </button>
              <label className="btn outline upload-label">
                <FiUpload /> Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  hidden
                  ref={fileInputRef}
                />
              </label>
            </div>

            <p className="storage-footer">
              Current URLs: <span>{filtered ? filtered.length : 0}</span>
            </p>
          </div>

          {/* Cloud Storage */}
          <div className="storage-card">
            <div className="storage-header">
              <FiCloud className="storage-icon" />
              <h3>Cloud Storage</h3>
            </div>
            <p className="storage-desc">
              Save your URLs to browser storage for quick access across sessions.
            </p>

            <div className="storage-buttons cloud">
              <button className="btn cloud-btn" onClick={onSaveToCloud}>
                <FiSave /> Save to Cloud
              </button>
            </div>

            <p className="storage-footer">Cloud saves: 0/10</p>
          </div>
        </div>
      )}
    </div>
  );
}
