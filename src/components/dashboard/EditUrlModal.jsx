// EditUrlModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiX, FiCalendar, FiLoader, FiTag, FiStar } from "react-icons/fi";
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
    userTags,
  } = ctx;

  const MAX_TAGS = 4;
  const [selectedDate, setSelectedDate] = useState(
    formData?.reminder_at ? new Date(formData.reminder_at) : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagError, setTagError] = useState("");

  const titleRef = useRef(null);

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

  // Choose an icon for a tag label, preferring userTags[i].icon when available
  function iconNodeForTagLabel(label) {
    const plain = String(label || "").replace(/^#/, "");
    if (Array.isArray(userTags)) {
      for (const ut of userTags) {
        const raw =
          typeof ut === "string" ? ut : ut?.tag ?? ut?.label ?? ut?.name ?? "";
        const iconStr =
          typeof ut === "object" && ut && ut.icon ? String(ut.icon) : "";
        if (
          String(raw || "")
            .replace(/^#/, "")
            .toLowerCase() === plain.toLowerCase()
        ) {
          if (iconStr) {
            return (
              <span className="user-tag-icon" aria-hidden>
                {iconStr}
              </span>
            );
          }
          break;
        }
      }
    }
    const lower = plain.toLowerCase();
    const IconComp =
      lower === "favorite" || lower === "favourite" ? FiStar : FiTag;
    return <IconComp className="user-tag-icon" aria-hidden="true" />;
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

  // Removed addTagsFromString/removeTagAt; tags are managed via toggleTag and formData.tags

  // Toggle tag selection via user tag buttons
  function toggleTag(label) {
    const normalized = label.startsWith("#")
      ? label.toLowerCase()
      : `#${label.toLowerCase()}`;
    setFormData?.((prev = {}) => {
      const existing = normalizeIncomingTags(prev.tags ?? []);
      const lower = existing.map((t) => t.toLowerCase());
      const idx = lower.indexOf(normalized);
      if (idx >= 0) {
        existing.splice(idx, 1);
        return { ...prev, tags: existing };
      }
      if (existing.length >= MAX_TAGS) {
        setTagError(`Maximum ${MAX_TAGS} tags allowed`);
        clearTagErrorSoon();
        return prev;
      }
      return { ...prev, tags: [...existing, normalized] };
    });
  }

  // Remove a tag from the URL's selected tags (protect 'favorite'/'favourite')
  function removeTag(label) {
    const normalized = label.startsWith("#")
      ? label.toLowerCase()
      : `#${label.toLowerCase()}`;
    const plain = normalized.replace(/^#/, "");
    if (
      plain.toLowerCase() === "favorite" ||
      plain.toLowerCase() === "favourite"
    ) {
      // Do not remove the 'favorite' tag
      return;
    }
    setFormData?.((prev = {}) => {
      const existing = normalizeIncomingTags(prev.tags ?? []);
      const lower = existing.map((t) => t.toLowerCase());
      const idx = lower.indexOf(normalized);
      if (idx >= 0) {
        existing.splice(idx, 1);
      }
      return { ...prev, tags: existing };
    });
  }

  // Validation & submit (keeps your original logic)
  // parseTags removed; tags handled via normalized array selection
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
        tags: normalizeIncomingTags(formData?.tags ?? []),
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
  const chips = normalizeIncomingTags(formData?.tags ?? []);
  // Build a set of normalized user tags for quick exclusion
  const userTagLabels = Array.isArray(userTags)
    ? userTags.map((ut) =>
        typeof ut === "string" ? ut : ut?.tag ?? ut?.label ?? ut?.name ?? ""
      )
    : [];
  const normalizedUserTagSet = new Set(
    normalizeIncomingTags(userTagLabels).map((t) => t.toLowerCase())
  );
  // Only show selected chips that are NOT in the user's global tags
  const nonUserSelectedChips = chips.filter(
    (t) => !normalizedUserTagSet.has(t.toLowerCase())
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
              <div className="edit add-link-field field tags-field">
                <div className="edit field-label">Tags</div>

                <div className="edit tag-input-wrap">
                  {/* User tags shelf with selected state indicator (matching AddUrlModal design) */}
                  <div
                    className="user-tags-shelf"
                    role="list"
                    aria-label="Your tags"
                  >
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
                          ? label.toLowerCase()
                          : `#${label.toLowerCase()}`;
                        const already = chips.some(
                          (c) => c.toLowerCase() === normalized
                        );
                        return (
                          <button
                            key={`user-tag-${idx}`}
                            type="button"
                            className={`user-tag-btn ${
                              already ? "selected" : ""
                            }`}
                            onClick={() => {
                              if (already) {
                                removeTag(normalized);
                              } else if (chips.length < MAX_TAGS) {
                                toggleTag(label);
                              } else {
                                setTagError(`Maximum ${MAX_TAGS} tags allowed`);
                                clearTagErrorSoon();
                              }
                            }}
                            disabled={!already && chips.length >= MAX_TAGS}
                            aria-pressed={already}
                            aria-label={
                              already
                                ? `Remove tag ${label.replace(/^#/, "")}`
                                : `Add tag ${label.replace(/^#/, "")}`
                            }
                            title={already ? "Click to remove" : "Click to add"}
                          >
                            {icon ? (
                              <span className="user-tag-icon" aria-hidden>
                                {icon}
                              </span>
                            ) : (
                              iconNodeForTagLabel(label)
                            )}
                            <span className="user-tag-label">
                              {label.startsWith("#") ? label.slice(1) : label}
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  {/* Show any non-user tags that were selected (custom tags not in user's global tags) */}
                  {nonUserSelectedChips.length > 0 && (
                    <div
                      className="edit selected-tags"
                      aria-label="Custom selected tags"
                    >
                      {nonUserSelectedChips.map((t, idx) => {
                        const plain = t.replace(/^#/, "");
                        const lower = plain.toLowerCase();
                        const isProtected =
                          lower === "favorite" || lower === "favourite";
                        return (
                          <div
                            key={`${t}-${idx}`}
                            className="user-tag-btn selected"
                            title={`Tag ${plain}`}
                            aria-label={`Tag ${plain}`}
                          >
                            {iconNodeForTagLabel(plain)}
                            <span className="user-tag-label">{plain}</span>
                            {!isProtected && (
                              <button
                                type="button"
                                className="tag-remove"
                                aria-label={`Remove tag ${plain}`}
                                title={`Remove tag ${plain}`}
                                onClick={() => removeTag(t)}
                              >
                                <FiX />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={`edit tag-limit ${tagError ? "has-error" : ""}`}
                    aria-live="polite"
                  >
                    <small>
                      Tags: {chips.length}/{MAX_TAGS}
                      {tagError ? ` — ${tagError}` : ""}
                    </small>
                  </div>
                </div>
              </div>

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
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
