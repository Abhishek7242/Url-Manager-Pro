import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiLoader } from "react-icons/fi";
import "../CSS/EditUrlModal.css";
import UrlContext from "../../context/url_manager/UrlContext";

export default function EditUrlModal({
  isOpen = false,
  onClose = () => {},
  defaultValues = {},
}) {
  const context = React.useContext(UrlContext);
  const {
    updateUrl,
    getAllUrls,
    showNotify,
    setUrls,
    archive,
    formData,
    setFormData,
  } = context;
  // Initialize formData with defaultValues when modal opens
  useEffect(() => {
    if (isOpen && defaultValues && Object.keys(defaultValues).length > 0) {
      // normalize tags to array if provided as string
      const tags = Array.isArray(defaultValues.tags)
        ? defaultValues.tags
        : (defaultValues.tags || "")
            .toString()
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      setFormData({
        ...formData,
        title: defaultValues.title || "",
        url: defaultValues.url || "",
        description: defaultValues.description || defaultValues.note || "",
        tags,
        tagsInput: tags.join(", "), // Store the raw input value
        reminder_at: defaultValues.reminder_at || defaultValues.reminder || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultValues]);

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

    if (!(formData.title || "").trim()) {
      newErrors.title = "Title is required";
    }

    if (!(formData.url || "").trim()) {
      newErrors.url = "URL is required";
    } else if (!isValidUrl((formData.url || "").trim())) {
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
        title: (formData.title || "").trim(),
        url: (formData.url || "").trim(),
        description: (formData.description || "").trim(),
        status: archive ? "archived" : "active",
        tags: parseTags(formData.tagsInput || formData.tags?.toString() || ""),
        url_clicks: 0,
        reminder_at: formData.reminder_at || formData.reminder || null,
      };

      // Optimistic UI update
      setUrls((prevUrls) =>
        prevUrls.map((url) =>
          url.id === formData.id ? { ...url, ...newLink } : url
        )
      );

      // Send to API
      let res = await updateUrl(formData.id, newLink);

      if (res) {
        showNotify("success", "URL updated successfully!");
        onClose();

        // Clear form data
        setFormData({});

        // Refresh URLs from server to ensure consistency
        const refreshedUrls = await getAllUrls();
        if (refreshedUrls && refreshedUrls.data) {
          setUrls(refreshedUrls.data);
        }
      }
    } catch (error) {
      // console.error("Error updating URL:", error);
      showNotify("error", "Failed to update URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editurl-title"
    >
      <div className="modal-card">
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          <FiX />
        </button>

        <h3 id="editurl-title" className="modal-heading">
          Edit URL
        </h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="add-link-field field">
            <div className="field-label">Title</div>
            <input
              id="addurl-title"
              value={formData.title || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="Enter URL title"
              className={errors.title ? "error" : ""}
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </label>

          <label className="add-link-field field">
            <div className="field-label">URL</div>
            <input
              value={formData.url || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, url: e.target.value }));
                if (errors.url) setErrors((prev) => ({ ...prev, url: null }));
              }}
              placeholder="https://example.com"
              className={errors.url ? "error" : ""}
            />
            {errors.url && <div className="field-error">{errors.url}</div>}
          </label>

          <label className="add-link-field field">
            <div className="field-label">Notes</div>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Add your notes here..."
              rows={4}
            />
          </label>

          <label className="add-link-field field">
            <div className="field-label">Tags</div>
            <input
              value={
                formData.tagsInput ||
                (Array.isArray(formData.tags)
                  ? formData.tags.join(", ")
                  : String(formData.tags || ""))
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tagsInput: e.target.value,
                  tags: parseTags(e.target.value), // Keep parsed tags in sync but don't display them
                }))
              }
              onBlur={(e) => {
                // Clean up the input on blur
                const parsedTags = parseTags(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  tagsInput: parsedTags.join(", "),
                  tags: parsedTags,
                }));
              }}
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
                value={formData.reminder_at || formData.reminder || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reminder_at: e.target.value,
                  }))
                }
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
              disabled={
                isLoading ||
                !(formData.title || "").trim() ||
                !(formData.url || "").trim()
              }
              type="submit"
              className="addbtn btn primary"
            >
              {isLoading ? (
                <>
                  <FiLoader
                    className="animate-spin"
                    style={{ marginRight: "8px" }}
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
