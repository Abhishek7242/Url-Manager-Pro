import React, { useEffect, useRef, useState } from "react";
import { FiX, FiSave, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import "../../CSS/AddTagModal.css"; // reuse same modal css

// Props:
// - tagItem: { id, tag, icon }
// - onClose: fn()
// - onSave: async fn({ id, tag, icon }) -> { success: boolean, message? }
// - existingTags: array of tag strings (to check duplicates)
// - closeOnSuccess: boolean
export default function EditTagModal({
  tagItem = {},
  onClose,
  onSave,
  existingTags = [],
  closeOnSuccess = false,
}) {
  const [tagName, setTagName] = useState((tagItem?.tag ?? "").toString());
  const [icon, setIcon] = useState(tagItem?.icon ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerStyle, setPickerStyle] = useState(null); // dynamic fixed positioning
  const inputRef = useRef(null);
  const pickerWrapperRef = useRef(null);

  const normalize = (s) => (s ?? "").toString().trim().toLowerCase();

  // basic mobile detection (used for UX; not perfect but practical)
  const isMobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|Phone|Mobile/i.test(navigator.userAgent);

  useEffect(() => {
    // focus text input on mount
    inputRef.current?.focus?.();
  }, []);

  useEffect(() => {
    setTagName(tagItem?.tag ?? "");
    setIcon(tagItem?.icon ?? "");
  }, [tagItem]);

  // compute and set picker position (fixed) so it stays inside viewport
  const openPicker = () => {
    // ensure text input not focused so mobile keyboard doesn't open
    try {
      inputRef.current?.blur?.();
    } catch (_) {}

    // prefer bottom-sheet on mobile to avoid keyboard conflicts
    if (isMobile) {
      const viewportH =
        window.innerHeight ||
        (window.visualViewport && window.visualViewport.height) ||
        800;
      const sheetH = Math.min(440, Math.round(viewportH * 0.5)); // half screen up to 440
      setPickerStyle({
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: sheetH,
        zIndex: 3000,
        borderRadius: "12px 12px 0 0",
      });
      setShowEmojiPicker(true);
      return;
    }

    // desktop/tablet flow: anchor near input but fixed so it won't be clipped by overflow containers
    if (!inputRef.current) {
      setShowEmojiPicker(true);
      return;
    }

    const INPUT_PADDING = 8; // small offset from input
    const PICKER_W = 340; // pass width to EmojiPicker
    const PICKER_H = 400; // pass height to EmojiPicker

    const rect = inputRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // prefer below input
    let top = rect.bottom + INPUT_PADDING;
    let left = rect.left;

    // flip above if not enough space below
    if (top + PICKER_H > viewportH) {
      top = rect.top - PICKER_H - INPUT_PADDING;
    }

    // ensure left + width doesn't overflow right edge
    if (left + PICKER_W > viewportW) {
      left = Math.max(8, viewportW - PICKER_W - 8);
    }

    // ensure left not negative
    if (left < 8) left = 8;

    // clamp top
    if (top < 8) top = 8;

    setPickerStyle({
      position: "fixed",
      top: Math.round(top),
      left: Math.round(left),
      width: PICKER_W,
      height: PICKER_H,
      zIndex: 2000,
    });

    setShowEmojiPicker(true);
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

  const handleEmojiSelect = (emojiData) => {
    setIcon(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleClearIcon = () => setIcon("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const value = (tagName ?? "").toString().trim();
    if (!value) {
      setError("Tag name cannot be empty");
      return;
    }

    const duplicate = (existingTags || []).some(
      (t) =>
        normalize(t) === normalize(value) &&
        normalize(t) !== normalize(tagItem?.tag)
    );
    if (duplicate) {
      setError("You already added this tag.");
      return;
    }

    setLoading(true);
    try {
      if (typeof onSave !== "function") {
        throw new Error("onSave is not provided or not a function");
      }

      const result = await onSave(tagItem?.id, icon ?? "😊", value);
      const ok = result?.success === true || result === true;
      if (!ok) {
        setError(result?.message || "Could not update tag. Please try again.");
        return;
      }

      if (closeOnSuccess) {
        setTimeout(() => onClose && onClose(), 600);
      } else {
        onClose && onClose();
      }
    } catch (err) {
      console.error("EditTagModal save error:", err);
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addtag-overlay" role="dialog" aria-modal="true">
      <div className="addtag-modal" role="document">
        <div className="addtag-header">
          <h3>Edit Tag</h3>
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
          <label htmlFor="editTagName" className="addtag-label">
            Tag Name
          </label>
          <input
            id="editTagName"
            ref={inputRef}
            type="text"
            value={tagName}
            onChange={(ev) => {
              setError("");
              setTagName(ev.target.value);
            }}
            placeholder="Enter tag name..."
            className={`addtag-input ${error ? "has-error" : ""}`}
            autoComplete="off"
            disabled={loading}
          />

          {/* Emoji section - avoid focusing an input on mobile */}
          <div className="emoji-section" style={{ marginTop: 12 }}>
            <label className="addtag-label">Icon (emoji)</label>

            <div
              className="emoji-input-container"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 6,
              }}
            >
              {/* Use a div button instead of input to avoid keyboard on mobile */}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  openPicker();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPicker();
                  }
                }}
                className="addtag-input emoji-input"
                style={{
                  cursor: "pointer",
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  gap: 8,
                }}
                aria-label="Choose emoji"
                title="Choose emoji"
              >
                <span style={{ opacity: icon ? 1 : 0.5 }}>
                  {icon ? icon : "Click emoji to change"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="emoji-btn"
                  onClick={(ev) => {
                    ev.preventDefault();
                    openPicker();
                  }}
                  title="Choose emoji"
                >
                  <FiSmile />
                </button>

                <button
                  type="button"
                  className="btn-tertiary"
                  onClick={handleClearIcon}
                  title="Clear icon"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* render fixed-position picker so it won't be clipped */}
          {showEmojiPicker && (
            <div
              ref={pickerWrapperRef}
              style={{
                position: pickerStyle?.position ?? "fixed",
                top: pickerStyle?.top ?? undefined,
                left: pickerStyle?.left ?? undefined,
                right: pickerStyle?.right ?? undefined,
                bottom: pickerStyle?.bottom ?? undefined,
                width: pickerStyle?.width ?? 340,
                height: pickerStyle?.height ?? 400,
                zIndex: pickerStyle?.zIndex ?? 2000,
                boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
                borderRadius:
                  pickerStyle && pickerStyle.bottom === 0
                    ? "12px 12px 0 0"
                    : 10,
                // overflow: "hidden",
                background: "var(--card, #0f1726)",
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                theme="dark"
                width={"100%"}
                height={"100%"}
                autoFocusSearch={false}
              />
            </div>
          )}

          {error && <div className="error-text">{error}</div>}

          <div className="addtag-actions">
            <button
              type="submit"
              className="add-btn"
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? <span className="btn-loader" /> : <FiSave />}
              <span>{loading ? "Saving..." : "Save"}</span>
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
