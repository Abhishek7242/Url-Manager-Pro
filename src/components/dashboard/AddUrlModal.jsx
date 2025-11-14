import React, { useState, useEffect, useRef } from "react";
import { FiX, FiCalendar, FiLoader } from "react-icons/fi";
import "../CSS/AddUrlModal.css";
import UrlContext from "../../context/url_manager/UrlContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddUrlModal({
  isOpen = false,
  onClose = () => {},
  defaultValues = {},
}) {
  const ctx = React.useContext(UrlContext) || {};
  const { addUrl, getAllUrls, showNotify, setUrls, archive, userTags } = ctx;

  const MAX_TAGS = 4;

  // fields
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reminder, setReminder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagError, setTagError] = useState("");

  const titleRef = useRef(null);

  // seed state only when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setTitle(defaultValues.title || "");
    setUrl(defaultValues.url || "");
    setNote(defaultValues.note || "");
    const iv = Array.isArray(defaultValues.tags)
      ? defaultValues.tags
      : typeof defaultValues.tags === "string"
      ? defaultValues.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    setTags(iv.map((t) => (t.startsWith("#") ? t : `#${t}`)));
    setSelectedDate(
      defaultValues.reminder ? new Date(defaultValues.reminder) : null
    );
    setReminder(defaultValues.reminder || "");
    setTimeout(() => titleRef.current?.focus(), 80);
  }, []);

  if (!isOpen) return null;

  // helpers
  const normalizeTag = (raw) => {
    if (!raw) return "";
    const t = raw.trim();
    if (!t) return "";
    return t.startsWith("#") ? t : `#${t}`;
  };

  const parseTagsFromString = (s) =>
    s
      .toString()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map(normalizeTag);

  const remainingSlots = () => Math.max(0, MAX_TAGS - tags.length);

  const addTagFromInput = (raw) => {
    if (!raw) return;
    if (tags.length >= MAX_TAGS) {
      setTagError(`Maximum ${MAX_TAGS} tags allowed`);
      clearTagErrorSoon();
      return;
    }
    const incoming = raw.includes(",")
      ? parseTagsFromString(raw)
      : [normalizeTag(raw)];
    const allowed = remainingSlots();
    const toAdd = incoming.slice(0, allowed);
    if (toAdd.length === 0) {
      setTagError(`Maximum ${MAX_TAGS} tags allowed`);
      clearTagErrorSoon();
      return;
    }
    setTags((prev) => {
      const lower = new Set(prev.map((p) => p.toLowerCase()));
      const merged = [...prev];
      for (const t of toAdd) {
        if (!lower.has(t.toLowerCase())) {
          merged.push(t);
          lower.add(t.toLowerCase());
        }
      }
      return merged;
    });
  };

  const removeTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
    setTagError("");
  };

  const clearTagErrorSoon = () => {
    setTimeout(() => setTagError(""), 2200);
  };

  // utility to remove last tag
  const removeLastTag = () => {
    setTags((prev) => (prev.length ? prev.slice(0, -1) : prev));
    setTagError("");
  };

  const isValidUrl = (s) => {
    try {
      const u = new URL(s);
      return (
        !!u.protocol && (u.protocol === "http:" || u.protocol === "https:")
      );
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!url.trim()) newErrors.url = "URL is required";
    else if (!isValidUrl(url.trim()))
      newErrors.url = "Please enter a valid URL (include https://)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const iso = date ? date.toISOString().split("T")[0] : "";
    setReminder(iso);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const finalTags = tags
        .slice(0, MAX_TAGS)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));
      const newLink = {
        title: title.trim(),
        url: url.trim(),
        description: note.trim(),
        status: archive ? "archived" : "active",
        tags: finalTags,
        url_clicks: 0,
        reminder_at: reminder || null,
      };

      setUrls?.((prev) => [newLink, ...(prev || [])]);
      const res = await addUrl?.(newLink);

      if (res) {
        showNotify?.("success", "URL added successfully!");
        onClose?.();
        setTitle("");
        setUrl("");
        setNote("");
        setTags([]);
        setReminder(null);
        setSelectedDate(null);
        const refreshedUrls = await getAllUrls?.();
        if (refreshedUrls && refreshedUrls.data) setUrls?.(refreshedUrls.data);
      }
    } catch (err) {
      console.error(err);
      showNotify?.("error", "Failed to add URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay add"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addurl-title"
    >
      <div className="modal-card">
        <button
          className="modal-close"
          aria-label="Close"
          onClick={() => {
            onClose();
            setTitle("");
            setUrl("");
            setNote("");
            setTags([]);
            setReminder(null);
            setSelectedDate(null);
          }}
          disabled={isLoading}
          type="button"
        >
          <FiX />
        </button>

        <h3 id="addurl-title" className="modal-heading">
          Add New URL
        </h3>

        {/* form becomes scrollable when tall */}
        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Title + URL row */}
          <div className="field-row two-col-row">
            <label className="add-link-field field">
              <div className="field-label">Title</div>
              <input
                ref={titleRef}
                id="addurl-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: null }));
                }}
                placeholder="Enter URL title"
                className={errors.title ? "error" : ""}
                autoComplete="off"
                type="text"
              />
              {errors.title && (
                <div className="field-error">{errors.title}</div>
              )}
            </label>

            <label className="add-link-field field">
              <div className="field-label">URL</div>
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errors.url) setErrors((p) => ({ ...p, url: null }));
                }}
                placeholder="https://example.com"
                className={errors.url ? "error" : ""}
                autoComplete="off"
                type="url"
              />
              {errors.url && <div className="field-error">{errors.url}</div>}
            </label>
          </div>

          {/* Notes */}
          <label className="add-link-field field">
            <div className="field-label">Notes</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your notes here..."
              rows={4}
            />
          </label>

          {/* Tags + Date on same line */}
          <div className="field-row tags-date-row">
            <div className="add-link-field field tags-field">
              <div className="field-label">Tags</div>

              <div className="tag-input-wrap">
                {/* User tags shelf (click to add) */}
                <div className="user-tags-shelf" aria-label="Your tags">
                  {Array.isArray(userTags) &&
                    userTags.map((ut, idx) => {
                      const raw =
                        typeof ut === "string"
                          ? ut
                          : ut?.tag ?? ut?.label ?? ut?.name ?? "";
                      const icon =
                        typeof ut === "object" && ut && ut.icon
                          ? String(ut.icon)
                          : "";
                      const label = String(raw || "");
                      const normalized = label.startsWith("#")
                        ? label
                        : `#${label}`;
                      const already = tags.some(
                        (t) => t.toLowerCase() === normalized.toLowerCase()
                      );
                      const canAdd = !already && tags.length < MAX_TAGS;
                      return (
                        <button
                          key={`user-tag-${idx}`}
                          type="button"
                          className={`user-tag-btn ${
                            already ? "selected" : ""
                          }`}
                          onClick={() => {
                            if (already) {
                              setTags((prev) =>
                                prev.filter(
                                  (t) =>
                                    t.toLowerCase() !== normalized.toLowerCase()
                                )
                              );
                              setTagError("");
                            } else if (tags.length < MAX_TAGS) {
                              addTagFromInput(normalized);
                            } else {
                              setTagError(`Maximum ${MAX_TAGS} tags allowed`);
                              clearTagErrorSoon();
                            }
                          }}
                          disabled={!already && tags.length >= MAX_TAGS}
                          aria-pressed={already}
                          aria-label={
                            already ? `Remove tag ${label}` : `Add tag ${label}`
                          }
                          title={already ? "Click to remove" : `Click to add`}
                        >
                          {icon ? (
                            <span className="user-tag-icon" aria-hidden>
                              {icon}
                            </span>
                          ) : null}
                          <span className="user-tag-label">
                            {label.startsWith("#") ? label.slice(1) : label}
                          </span>
                        </button>
                      );
                    })}
                </div>
                {/* Removed chips list; selection is indicated on the user tag buttons */}

                {/* Removed Clear All / Clear Last actions as requested */}

                <div
                  className={`tag-limit ${tagError ? "has-error" : ""}`}
                  aria-live="polite"
                >
                  <small>
                    Tags: {tags.length}/{MAX_TAGS}
                    {tagError ? ` — ${tagError}` : ""}
                  </small>
                </div>
              </div>
            </div>

            {/* Date on same row as tags */}
            <label className="add-link-field field date-field">
              <div className="field-label">Reminder Date (Optional)</div>
              <div
                className="date-row clickable"
                onClick={() => {
                  const el = document.querySelector(
                    ".react-datepicker__input-container input"
                  );
                  if (el) el.focus();
                }}
              >
                <FiCalendar className="date-icon" />
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  placeholderText="Select a date"
                  dateFormat="dd-MM-yyyy"
                  isClearable
                  showPopperArrow={false}
                  className="date-input"
                />
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-actions add-url-actions">
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
                    style={{ marginRight: 8 }}
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
