// EditUrlModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiX, FiCalendar, FiLoader } from "react-icons/fi";
import "../CSS/EditUrlModal.css";
import UrlContext from "../../context/url_manager/UrlContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * EditUrlModal — normalized tag handling + chip UI
 * Fix: use functional setFormData updates to avoid stale formData when adding/removing tags.
 */
export default function EditUrlModal({
  isOpen = false,
  onClose = () => {},
  defaultValues = {},
}) {
  const ctx = React.useContext(UrlContext) || {};
  const {
    updateUrl,
    getAllUrls,
    showNotify,
    setUrls,
    archive,
    formData = {},
    setFormData,
  } = ctx;

  const MAX_TAGS = 4;
  const [selectedDate, setSelectedDate] = useState(
    formData?.reminder_at ? new Date(formData.reminder_at) : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagError, setTagError] = useState("");

  const titleRef = useRef(null);
  const tagInputRef = useRef(null);

  // Helper: normalize incoming tags (string or array) -> flattened array of "#tag" strings (deduped)
  function normalizeIncomingTags(input) {
    if (input === undefined || input === null) return [];

    let arr;
    if (typeof input === "string") {
      arr = input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(input)) {
      arr = input.slice();
    } else {
      return [];
    }

    const out = [];
    const seen = new Set();
    for (let el of arr) {
      if (el === undefined || el === null) continue;
      const parts = String(el).includes(",")
        ? String(el)
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [String(el).trim()];
      for (const p of parts) {
        if (!p) continue;
        const t = p.startsWith("#") ? p : `#${p}`;
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
      }
    }
    return out;
  }

  // Seed formData when modal opens (store tags as array)
  useEffect(() => {
    if (!isOpen) return;
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      const rawTags =
        defaultValues.tags ??
        defaultValues.tagsInput ??
        defaultValues.tag ??
        defaultValues.tagList ??
        [];
      const tags = normalizeIncomingTags(rawTags).slice(0, MAX_TAGS);
      setFormData?.((prev = {}) => ({
        ...prev,
        id: defaultValues.id ?? defaultValues._id ?? prev?.id,
        title: defaultValues.title ?? prev?.title ?? "",
        url: defaultValues.url ?? prev?.url ?? "",
        description:
          defaultValues.description ??
          defaultValues.note ??
          prev?.description ??
          "",
        tags,
        tagsInput: "", // keep input empty so chips are shown
        reminder_at:
          defaultValues.reminder_at ??
          defaultValues.reminder ??
          prev?.reminder_at ??
          "",
      }));
      setTimeout(() => titleRef.current?.focus(), 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultValues]);

  // Sync date when formData.reminder_at changes
  useEffect(() => {
    if (formData && formData.reminder_at) {
      const d = new Date(formData.reminder_at);
      setSelectedDate(!isNaN(d.getTime()) ? d : null);
    } else {
      setSelectedDate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.reminder_at]);

  // Tag helpers
  const remainingSlots = () =>
    Math.max(
      0,
      MAX_TAGS - (Array.isArray(formData?.tags) ? formData.tags.length : 0)
    );
  const clearTagErrorSoon = () => setTimeout(() => setTagError(""), 1800);

  // Add tags using functional updater to avoid stale reads
  function addTagsFromString(raw) {
    if (!raw || !String(raw).trim()) return;
    const incoming = normalizeIncomingTags(raw);
    if (!incoming.length) return;

    setFormData?.((prev = {}) => {
      const existing = normalizeIncomingTags(prev.tags ?? prev.tagsInput ?? []);
      const lower = new Set(existing.map((p) => p.toLowerCase()));
      const allowed = Math.max(0, MAX_TAGS - existing.length);
      const toAdd = incoming.slice(0, allowed);
      if (!toAdd.length) {
        // set tagError outside setFormData so component re-renders with error
        setTagError(`Maximum ${MAX_TAGS} tags allowed`);
        clearTagErrorSoon();
        return { ...prev, tags: existing, tagsInput: "" };
      }
      for (const t of toAdd) {
        if (!lower.has(t.toLowerCase())) {
          existing.push(t);
          lower.add(t.toLowerCase());
        }
      }
      return { ...prev, tags: existing.slice(0, MAX_TAGS), tagsInput: "" };
    });
  }

  // Remove tag using functional updater
  function removeTagAt(index) {
    setFormData?.((prev = {}) => {
      const existing = normalizeIncomingTags(prev.tags ?? prev.tagsInput ?? []);
      if (index < 0 || index >= existing.length) return prev;
      existing.splice(index, 1);
      setTagError("");
      return { ...prev, tags: existing, tagsInput: "" };
    });
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const raw = String(formData.tagsInput || "")
        .trim()
        .replace(/,+$/, "");
      if (raw) addTagsFromString(raw);
    } else if (e.key === "Backspace" && !(formData.tagsInput || "").trim()) {
      // remove last tag if input empty
      setFormData?.((prev = {}) => {
        const existing = normalizeIncomingTags(
          prev.tags ?? prev.tagsInput ?? []
        );
        existing.pop();
        return { ...prev, tags: existing, tagsInput: "" };
      });
    }
  }

  function handleTagPaste(e) {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (!text) return;
    if (text.includes(",")) {
      e.preventDefault();
      // we still use functional updater below
      setFormData?.((prev = {}) => {
        const existing = normalizeIncomingTags(
          prev.tags ?? prev.tagsInput ?? []
        );
        const lower = new Set(existing.map((p) => p.toLowerCase()));
        const parts = normalizeIncomingTags(text);
        const allowed = Math.max(0, MAX_TAGS - existing.length);
        const toAdd = parts.slice(0, allowed);
        if (!toAdd.length) {
          setTagError(`Maximum ${MAX_TAGS} tags allowed`);
          clearTagErrorSoon();
          return { ...prev, tags: existing, tagsInput: "" };
        }
        for (const t of toAdd) {
          if (!lower.has(t.toLowerCase())) {
            existing.push(t);
            lower.add(t.toLowerCase());
          }
        }
        return { ...prev, tags: existing.slice(0, MAX_TAGS), tagsInput: "" };
      });
    }
  }

  // Validation & submit (keeps your original logic)
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
    if (!(formData.title || "").trim()) newErrors.title = "Title is required";
    if (!(formData.url || "").trim()) newErrors.url = "URL is required";
    else if (!isValidUrl((formData.url || "").trim()))
      newErrors.url = "Please enter a valid URL (include https://)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData?.((prev = {}) => ({
      ...prev,
      reminder_at: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
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
      setUrls?.((prevUrls = []) =>
        prevUrls.map((url) =>
          url.id === formData.id ? { ...url, ...newLink } : url
        )
      );

      // Send to API
      const res = await updateUrl?.(formData.id, newLink);

      if (res) {
        showNotify?.("success", "URL updated successfully!");
        onClose?.();

        // Clear formData and refresh
        setFormData?.({});
        const refreshed = await getAllUrls?.();
        if (refreshed && refreshed.data) setUrls?.(refreshed.data);
      }
    } catch (error) {
      showNotify?.("error", "Failed to update URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // defensive chips array for rendering (in case formData.tags is still string)
  const chips = normalizeIncomingTags(
    formData?.tags ?? formData?.tagsInput ?? []
  );

  if (!isOpen) return null;

  return (
    <div className="edit">
      <div
        className="edit modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editurl-title"
      >
        <div className="edit modal-card" onClick={(e) => e.stopPropagation()}>
          <button
            className="edit modal-close"
            aria-label="Close"
            onClick={onClose}
            type="button"
          >
            <FiX />
          </button>

          <h3 id="editurl-title" className="edit modal-heading">
            Edit URL
          </h3>

          <form
            className="edit modal-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Title + URL row */}
            <div className="edit field-row two-col-row">
              <label className="edit add-link-field field">
                <div className="edit field-label">Title</div>
                <input
                  ref={titleRef}
                  id="editurl-title-input"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData?.((prev = {}) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter URL title"
                  className={errors.title ? "error" : ""}
                  type="text"
                />
                {errors.title && (
                  <div className="edit field-error">{errors.title}</div>
                )}
              </label>

              <label className="edit add-link-field field">
                <div className="edit field-label">URL</div>
                <input
                  value={formData.url || ""}
                  onChange={(e) =>
                    setFormData?.((prev = {}) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  className={errors.url ? "error" : ""}
                  type="url"
                />
                {errors.url && (
                  <div className="edit field-error">{errors.url}</div>
                )}
              </label>
            </div>

            {/* Notes */}
            <label className="edit add-link-field field">
              <div className="edit field-label">Notes</div>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData?.((prev = {}) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Add your notes here..."
                rows={4}
              />
            </label>

            {/* Tags + Date row */}
            <div className="edit field-row tags-date-row">
              <label className="edit add-link-field field tags-field">
                <div className="edit field-label">Tags</div>

                <div className="edit tag-input-wrap">
                  <div
                    className="edit tags-list"
                    role="list"
                    onClick={() => tagInputRef.current?.focus()}
                  >
                    {chips.map((t, i) => (
                      <span
                        className="edit tag-chip"
                        key={`${String(t)}-${i}`}
                        role="listitem"
                      >
                        <span className="edit tag-text">
                          {String(t).startsWith("#") ? String(t).slice(1) : t}
                        </span>
                        <button
                          type="button"
                          className="edit tag-cut-btn"
                          onClick={() => removeTagAt(i)}
                          aria-label={`Remove tag ${t}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}

                    <input
                      ref={tagInputRef}
                      className="edit tag-input"
                      value={formData.tagsInput || ""}
                      onChange={(e) =>
                        setFormData?.((prev = {}) => ({
                          ...prev,
                          tagsInput: e.target.value,
                        }))
                      }
                      onKeyDown={handleTagKeyDown}
                      onPaste={handleTagPaste}
                      placeholder="type tag and press Enter or comma"
                      type="text"
                      disabled={remainingSlots() <= 0}
                    />
                  </div>

                  <div className="edit tag-actions">
                    <button
                      type="button"
                      className="edit btn add-tag-btn"
                      onClick={() =>
                        addTagsFromString(formData.tagsInput || "")
                      }
                      disabled={
                        remainingSlots() <= 0 ||
                        !(formData.tagsInput || "").trim()
                      }
                    >
                      Add
                    </button>

                    <button
                      type="button"
                      className="edit btn clear-tags-btn"
                      onClick={() =>
                        setFormData?.((prev = {}) => ({
                          ...prev,
                          tags: [],
                          tagsInput: "",
                        }))
                      }
                    >
                      Clear
                    </button>
                  </div>

                  <div
                    className={`edit tag-limit ${tagError ? "has-error" : ""}`}
                    aria-live="polite"
                  >
                    <small>
                      Tags:{" "}
                      {Array.isArray(formData.tags)
                        ? formData.tags.length
                        : chips.length}
                      /{MAX_TAGS}
                      {tagError ? ` — ${tagError}` : ""}
                    </small>
                  </div>
                </div>
              </label>

              <label className="edit add-link-field field date-field">
                <div className="edit field-label">Reminder Date (Optional)</div>
                <div
                  className="edit date-row"
                  onClick={() => {
                    const el = document.querySelector(
                      ".react-datepicker__input-container input"
                    );
                    if (el) el.focus();
                  }}
                >
                  <FiCalendar className="edit date-icon" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(d) => handleDateChange(d)}
                    placeholderText="Select a date"
                    dateFormat="dd-MM-yyyy"
                    isClearable
                    showPopperArrow={false}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    openToDate={new Date()}
                    className="edit date-input"
                  />
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="edit modal-actions">
              <button
                type="button"
                className="edit btn cancel"
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
                className="edit addbtn btn primary"
              >
                {isLoading ? (
                  <>
                    <FiLoader
                      className="edit animate-spin"
                      style={{ marginRight: 8 }}
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
    </div>
  );
}
