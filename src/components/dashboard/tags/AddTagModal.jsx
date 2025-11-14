import React, { useRef, useState, useEffect } from "react";
import { FiX, FiPlus, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import "../../CSS/AddTagModal.css";

export default function AddTagModal({
  onClose,
  onAdd,
  existingTags = [],
  closeOnSuccess = false,
}) {
  const [tagName, setTagName] = useState("");
  const [emoji, setEmoji] = useState(""); // 👈 new state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 👈 controls emoji section
  const [isMobilePicker, setIsMobilePicker] = useState(false); // true when bottom-sheet used
  const [pickerStyle, setPickerStyle] = useState(null); // inline style for wrapper
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const emojiInputRef = useRef(null);
  const pickerWrapperRef = useRef(null);

  const MAX_TAGS = 10;
  const currentCount = existingTags.length;
  const normalize = (s) => (s ?? "").toString().trim().toLowerCase();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // detect mobile (practical)
  const isMobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|Phone|Mobile/i.test(navigator.userAgent);

  // Helper: safely blur any focused element to avoid opening mobile keyboard
  const safeBlurActive = () => {
    try {
      // blur the tag input
      inputRef.current?.blur?.();
      // blur whatever has focus
      const active = document.activeElement;
      if (active && typeof active.blur === "function") active.blur();
    } catch (e) {
      // ignore
    }
  };

  // Open/toggle emoji picker — minimal footprint and mobile-aware
  const toggleEmojiPicker = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
      setIsMobilePicker(false);
      setPickerStyle(null);
      return;
    }

    safeBlurActive();

    // Small timeout to allow mobile browsers to hide keyboard (if any) before showing
    // (keeps UI snappy and avoids keyboard re-opening)
    setTimeout(() => {
      if (isMobile) {
        // bottom-sheet style for mobile
        const viewportH =
          (window.visualViewport && window.visualViewport.height) ||
          window.innerHeight ||
          800;
        const height = Math.min(440, Math.round(viewportH * 0.55)); // about half screen but capped
        setPickerStyle({
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height,
          width: "100%",
          zIndex: 3000,
          borderRadius: "12px 12px 0 0",
          // overflow: "hidden",
          background: "var(--card, #0f1726)",
          boxShadow: "0 -8px 30px rgba(2,6,23,0.6)",
        });
        setIsMobilePicker(true);
        setShowEmojiPicker(true);
        return;
      }

      // desktop/tablet: default inline wrapper (no positioning changes needed)
      setPickerStyle({
        position: "absolute",
      });
      setIsMobilePicker(false);
      setShowEmojiPicker(true);
    }, 50);
  };

  // Close picker only when clicking on addtag-overlay background (not children)
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleOverlayClick = (ev) => {
      // Only close if clicking directly on the overlay itself, not on any children
      if (ev.target.classList?.contains("addtag-overlay")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOverlayClick);
    document.addEventListener("touchstart", handleOverlayClick, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleOverlayClick);
      document.removeEventListener("touchstart", handleOverlayClick);
    };
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (currentCount >= MAX_TAGS) {
      setError(`You have reached the maximum of ${MAX_TAGS} tags.`);
      return;
    }

    const value = (tagName ?? "").toString().trim();
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
      const result = await onAdd(emoji ?? null, value);
      if (!result || result.success !== true) {
        setError(result?.message || "Could not add tag. Please try again.");
        return;
      }

      setTagName("");
      setEmoji("");
      setError("");
      inputRef.current?.focus();

      if (closeOnSuccess) {
        setTimeout(() => onClose(), 900);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Network error, try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressPct = Math.min(
    100,
    Math.round((currentCount / MAX_TAGS) * 100)
  );
  const nearLimit = currentCount >= MAX_TAGS - 2;
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

          {/* ✅ NEW EMOJI INPUT SECTION (UI unchanged) */}
          <div className="emoji-section">
            <label className="addtag-label">Tag Icon</label>
            <div className="emoji-input-container">
              <input
                type="text"
                value={emoji}
                onClick={() => {
                  // toggle picker safely without focusing input (prevents keyboard)
                  safeBlurActive();
                  toggleEmojiPicker();
                }}
                placeholder="Click to choose emoji"
                readOnly
                className="addtag-input emoji-input"
                ref={emojiInputRef}
              />
              <button
                type="button"
                className="emoji-btn"
                onClick={() => {
                  safeBlurActive();
                  toggleEmojiPicker();
                }}
              >
                <FiSmile />
              </button>
            </div>

            {showEmojiPicker && (
              <div
                ref={pickerWrapperRef}
                className="emoji-picker-wrapper"
                style={isMobilePicker ? pickerStyle : undefined}
              >
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setEmoji(e.emoji);
                    setShowEmojiPicker(false);
                    setIsMobilePicker(false);
                    setPickerStyle(null);
                  }}
                  theme="dark"
                  autoFocusSearch={false}
                />
              </div>
            )}
          </div>

          {error && <div className="error-text">{error}</div>}

          {/* Existing tags + progress section (unchanged) */}
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
                {existingTags.map((tag, idx) => (
                  <span key={idx} className="tag-chip">
                    {tag}
                  </span>
                ))}
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
