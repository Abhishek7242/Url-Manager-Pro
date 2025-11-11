import React, { useRef, useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import "../../CSS/AddTagModal.css";

export default function AddTagModal({
  onClose,
  onAdd,
  existingTags = [],
  closeOnSuccess = false,
}) {
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const MAX_TAGS = 10;
  const currentCount = existingTags.length;
  const normalize = (s) => (s ?? "").toString().trim().toLowerCase();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (currentCount >= MAX_TAGS) {
      setError(`You have reached the maximum of ${MAX_TAGS} tags.`);
      return;
    }

    const value = tagName.trim();
    if (!value) {
      setError("Tag name cannot be empty");
      return;
    }

    if (existingTags.some((t) => normalize(t) === normalize(value))) {
      setError("You already added this tag.");
      return;
    }

    setLoading(true);
    try {
      const result = await onAdd(value);

      if (!result || result.success !== true) {
        setError(result?.message || "Could not add tag. Please try again.");
        return;
      }

      setTagName("");
      setError("");
      inputRef.current?.focus();

      if (closeOnSuccess) {
        setTimeout(() => onClose(), 900);
      }
    } catch (err) {
      setError(err?.message || "Network error, try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressPct = Math.min(
    100,
    Math.round((currentCount / MAX_TAGS) * 100)
  );
  const nearLimit = currentCount >= MAX_TAGS - 2; // 8 or more shows warning color
  const atLimit = currentCount >= MAX_TAGS;

  return (
    <div className="addtag-overlay" role="dialog" aria-modal="true">
      <div className="addtag-modal" role="document">
        <div className="addtag-header">
          <h3>Add New Tag</h3>
          <button
            className="close-btn"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="addtag-form" noValidate>
          <label htmlFor="tagName" className="addtag-label">
            Tag Name
          </label>
          <input
            id="tagName"
            ref={inputRef}
            type="text"
            value={tagName}
            onChange={(e) => {
              setError("");
              setTagName(e.target.value);
            }}
            placeholder={atLimit ? "Tag limit reached" : "Enter tag name..."}
            className={`addtag-input ${error ? "has-error" : ""}`}
            autoComplete="off"
            disabled={loading || atLimit}
          />
          {error && <div className="error-text">{error}</div>}

          {/* EXISTING TAGS PANEL with top-right count badge + progress */}
          {existingTags.length > 0 && (
            <div className="existing-tags">
              <div className="existing-tags-header">
                <div className="existing-title">Existing Tags</div>

                <div
                  className={`count-badge ${
                    atLimit ? "limit" : nearLimit ? "warn" : ""
                  }`}
                >
                  <span className="count-number">{currentCount}</span>
                  <small className="count-max">/ {MAX_TAGS}</small>
                </div>
              </div>

              <div className="tag-list">
                {existingTags.map((tag, idx) => {
                  const isDuplicate =
                    tagName && normalize(tag) === normalize(tagName);
                  return (
                    <span
                      key={idx}
                      className={`tag-chip ${isDuplicate ? "duplicate" : ""}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>

              <div className="tag-progress" aria-hidden="true">
                <div className="tag-progress-bar">
                  <div
                    className="tag-progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="tag-progress-label">{progressPct}% used</div>
              </div>
            </div>
          )}

          <div className="addtag-actions">
            <button
              type="submit"
              className="add-btn"
              disabled={loading || atLimit}
              aria-disabled={loading || atLimit}
            >
              {loading ? <span className="btn-loader" /> : <FiPlus />}
              <span>
                {loading ? "Adding..." : atLimit ? "Limit Reached" : "Add Tag"}
              </span>
            </button>
            <button
              type="button"
              className="btn-tertiary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
