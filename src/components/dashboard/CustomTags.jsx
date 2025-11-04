import React, { useState, useRef, useEffect, useContext } from "react";
import { FiX, FiTag, FiZap, FiPlus } from "react-icons/fi";
import "../CSS/CustomTags.css";
import { Icon } from "@iconify/react";
import UrlContext from "../../context/url_manager/UrlContext";

export default function CustomTags({
  tags: initialTags = [],
  selected: initialSelected = null,
  inputFocus,
  onChange = () => {},
  onSelectChange = () => {},
  allowAdd = true,
  placeholder = "Add tag",
  showDropdown,
  setShowDropdown,
  disabledTags,
  setDisabledTags,
}) {
  const { setSearch, filtered } = useContext(UrlContext);
  const QUICK_ID = "__quick";

  const inputRef = useRef(null);

  const [tags, setTags] = useState([]);

  const [selected, setSelected] = useState(initialSelected || null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  // ✅ Load from localStorage ONCE, before anything else
  useEffect(() => {
    let storedDisabled = [];
    try {
      storedDisabled =
        JSON.parse(localStorage.getItem("lynkr_disabled_tags")) || [];
    } catch {
      storedDisabled = [];
    }

    setDisabledTags(storedDisabled);

    // Filter out disabled ones
    const filteredTags = initialTags.filter(
      (t) => !storedDisabled.some((d) => d.id === t.id)
    );
    setTags(filteredTags);
  }, []); // <- runs ONCE only, not dependent on initialTags to prevent reset

  // ✅ When initialTags change (like remote update), merge without breaking disabled state
  useEffect(() => {
    if (!initialTags.length) return;
    setTags((prev) => {
      const filtered = initialTags.filter(
        (t) => !disabledTags.some((d) => d.id === t.id)
      );
      return filtered;
    });
  }, [initialTags, disabledTags]);

  // ✅ Always sync disabled tags to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lynkr_disabled_tags", JSON.stringify(disabledTags));
    } catch (err) {
      console.warn("Failed to write disabled tags:", err);
    }
  }, [disabledTags]);

  // Count quick links
  const quickLinksCount = Array.isArray(filtered)
    ? filtered.filter((item) => item?.tags?.includes?.("#quicklink")).length
    : 0;

  // Icon resolver
  const getIconForLabel = (label = "") => {
    const key = (label || "").trim().toLowerCase();
    switch (key) {
      case "work":
        return <Icon icon="fluent:briefcase-24-filled" width="18" />;
      case "research":
        return <Icon icon="mdi:microscope" width="18" />;
      case "education":
        return <Icon icon="mdi:school" width="18" />;
      case "ai":
        return <Icon icon="noto:robot" width="18" />;
      case "reading":
        return <Icon icon="flat-color-icons:reading" width="18" />;
      default:
        return <Icon icon="ph:plus-circle-fill" width="18" />;
    }
  };

  // Add new tag
  const addTag = (label) => {
    const trimmed = (label || "").trim();
    if (!trimmed) return;

    // Avoid duplicates or re-adding disabled tag
    if (
      tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase()) ||
      disabledTags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      setValue("");
      setEditing(false);
      return;
    }

    const newTag = { id: `t-${Date.now()}`, label: trimmed };
    const next = [...tags, newTag];
    setTags(next);
    onChange(next);
    setValue("");
    setEditing(false);
  };

  // Remove tag permanently (add to disabled)
  const removeTag = (id) => {
    const tagToRemove = tags.find((t) => t.id === id);
    if (!tagToRemove) return;

    const nextVisible = tags.filter((t) => t.id !== id);
    const nextDisabled = [
      ...disabledTags.filter((d) => d.id !== tagToRemove.id),
      { id: tagToRemove.id, label: tagToRemove.label },
    ];

    setTags(nextVisible);
    setDisabledTags(nextDisabled);
    onChange(nextVisible);

    if (selected === id) {
      setSelected(null);
      onSelectChange(null);
      setSearch("");
    }

    // 🔹 Write immediately (no delay)
    localStorage.setItem("lynkr_disabled_tags", JSON.stringify(nextDisabled));
  };

  // Re-enable tag
  const enableTag = (id) => {
    const tagToEnable = disabledTags.find((t) => t.id === id);
    if (!tagToEnable) return;

    const nextDisabled = disabledTags.filter((t) => t.id !== id);
    const nextTags = [...tags, tagToEnable];

    setTags(nextTags);
    setDisabledTags(nextDisabled);
    onChange(nextTags);
    setShowDropdown(false);
    localStorage.setItem("lynkr_disabled_tags", JSON.stringify(nextDisabled));
  };

  // Tag selection
  const toggleSelect = (id) => {
    const next = selected === id ? null : id;
    setSelected(next);
    onSelectChange(next);

    if (next === QUICK_ID) setSearch("#quicklink");
    else if (next) {
      const selectedTag = tags.find((t) => t.id === next);
      setSearch(selectedTag ? `#${selectedTag.label}` : "");
    } else setSearch("");
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(value);
    } else if (e.key === "Escape") {
      setEditing(false);
      setValue("");
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div
      className={`ct-tags-wrap ${inputFocus ? "focus" : ""}`}
      role="group"
      aria-label="Custom tags"
    >
      <div className="ct-tags">
        {/* Quick Add */}
        <button
          type="button"
          className={`ct-pill ct-pill-quick ${
            selected === QUICK_ID ? "selected" : ""
          }`}
          onClick={() => toggleSelect(QUICK_ID)}
        >
          <span className="ct-pill-left">
            <FiZap className="ct-pill-icon" />
          </span>
          <span className="ct-pill-label">
            Quick Add <span className="ct-pill-count">{quickLinksCount}</span>
          </span>
        </button>

        {/* Active Tags */}
        {Array.isArray(tags) &&
          tags.map((t) => {
            const isSelected = selected === t.id;
            const icon = t.icon || getIconForLabel(t.label);
            return (
              <div
                key={t.id}
                className={`ct-pill ${isSelected ? "selected" : ""} ${t.label.toLowerCase()}-tag`}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                onClick={() => toggleSelect(t.id)}
              >
                <span className="ct-pill-left">{icon}</span>
                <span className="ct-pill-label">{t.label}</span>

                <button
                  type="button"
                  className="ct-remove-btn"
                  aria-label={`Remove ${t.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(t.id);
                  }}
                >
                  <FiX />
                </button>
              </div>
            );
          })}

        {/* Add Input */}
        {allowAdd && editing && (
          <div className="ct-input-pill">
            <input
              ref={inputRef}
              className="ct-input"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleInputKey}
              onBlur={() => {
                if (value.trim()) addTag(value);
                else {
                  setEditing(false);
                  setValue("");
                }
              }}
            />
          </div>
        )}

        {/* ➕ Dropdown for disabled tags */}
        <div className="ct-add-more">
          {/* <button
            className="ct-add-btn"
            title="Enable disabled tags"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FiPlus size={18} />
          </button> */}

          {/* {showDropdown && (
            <div className="ct-dropdown">
              {disabledTags.length === 0 ? (
                <div className="ct-dropdown-empty">No disabled tags</div>
              ) : (
                disabledTags.map((t) => (
                  <div
                    key={t.id}
                    className="ct-dropdown-item"
                    onClick={() => enableTag(t.id)}
                  >
                    <span>{t.label}</span>
                    <span className="ct-enable-text">Enable</span>
                  </div>
                ))
              )}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
