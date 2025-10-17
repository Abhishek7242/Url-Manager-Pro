import React, { useState } from "react";
import { FiX, FiCalendar, FiLoader } from "react-icons/fi";
import "../CSS/AddUrlModal.css";
import UrlContext from "../../context/url_manager/UrlContext";

export default function AddUrlModal({
  isOpen = false,
  onClose = () => {},
  defaultValues = {},
}) {
  const context = React.useContext(UrlContext);
  const { addUrl, getAllUrls, showNotify, setUrls, archive } = context;

  const [title, setTitle] = useState(defaultValues.title || "");
  const [url, setUrl] = useState(defaultValues.url || "");
  const [note, setNote] = useState(defaultValues.note || "");
  const [tagsStr, setTagsStr] = useState((defaultValues.tags || []).join(", "));
  const [reminder, setReminder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  function parseTags(input) {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function isValidUrl(s) {
    try {
      const u = new URL(s);
      return (
        !!u.protocol && (u.protocol === "http:" || u.protocol === "https:")
      );
    } catch {
      return false;
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl(url.trim())) {
      newErrors.url = "Please enter a valid URL (include https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  async function handleSubmit(e) {
    e.preventDefault();

    // Prevent multiple submissions
    if (isLoading) return;

    // Validate form
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const newLink = {
        title: title.trim(),
        url: url.trim(),
        description: note.trim(),
        status: archive ? "archived" : "active",
        tags: parseTags(tagsStr),
        url_clicks: 0,
        reminder_at: reminder || null,
      };

      // Optimistic UI update
      setUrls((prevUrls) => [newLink, ...prevUrls]);

      // Send to API
      let res = await addUrl(newLink);

      if (res) {
        showNotify("success", "URL added successfully!");
        onClose();

        // Clear form fields
        setTitle("");
        setUrl("");
        setNote("");
        setTagsStr("");
        setReminder(null);

        // Refresh URLs from server
        const refreshedUrls = await getAllUrls();
        if (refreshedUrls && refreshedUrls.data) {
          setUrls(refreshedUrls.data);
        }
      }
    } catch (error) {
      // console.error("Error adding URL:", error);
      showNotify("error", "Failed to add URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addurl-title"
    >
      <div className="modal-card">
        <button
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
          disabled={isLoading}
        >
          <FiX />
        </button>

        <h3 id="addurl-title" className="modal-heading">
          Add New URL
        </h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="add-link-field field">
            <div className="field-label">Title</div>
            <input
              id="addurl-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: null }));
                }
              }}
              placeholder="Enter URL title"
              className={errors.title ? "error" : ""}
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </label>

          <label className="add-link-field field">
            <div className="field-label">URL</div>
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) {
                  setErrors((prev) => ({ ...prev, url: null }));
                }
              }}
              placeholder="https://example.com"
              className={errors.url ? "error" : ""}
            />
            {errors.url && <div className="field-error">{errors.url}</div>}
          </label>

          <label className="add-link-field field">
            <div className="field-label">Notes</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your notes here..."
              rows={4}
            />
          </label>

          <label className="add-link-field field">
            <div className="field-label">Tags</div>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="work, important, reference (comma separated)"
            />
          </label>

          <label className="add-link-field field">
            <div className="field-label">Reminder Date (Optional)</div>

            <div
              className="date-row clickable"
              onClick={() => {
                document.getElementById("reminder-date-input")?.showPicker?.();
                document.getElementById("reminder-date-input")?.focus();
              }}
            >
              <FiCalendar className="date-icon" />
              <input
                id="reminder-date-input"
                type="date"
                value={reminder || ""}
                onChange={(e) => setReminder(e.target.value)}
                className="date-input"
              />
            </div>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="btn cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              disabled={isLoading || !title.trim() || !url.trim()}
              type="submit"
              className="addbtn btn primary"
            >
              {isLoading ? (
                <>
                  <FiLoader
                    className="animate-spin"
                    style={{ marginRight: "8px" }}
                  />
                  Adding...
                </>
              ) : (
                "Add URL"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
