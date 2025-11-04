// src/components/DisableTags.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { FiSearch, FiX, FiCheck, FiSlash } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";
import "../CSS/DisableTags.css"; // create or append styles
import { div } from "framer-motion/client";

/**
 * DisableTags
 *
 * props:
 * - tags: array of tag objects { id, label } (optional; if omitted, will try to use UrlContext.tags or computed tags)
 * - onChange: function(visibleTags) called when visible tags change
 */
export default function DisableTags({
  tags: initialTags = [],

  onChange = () => {},

  setShowDropdown,
  disabledTags = [],
    setDisabledTags,
  onClick = () => {},
}) {
  const ctx = useContext(UrlContext) || {};
  // fallback: try to read tags from context if prop isn't supplied
  const ctxTags = ctx.tags || ctx.initialTags || [];
  const allTags = Array.isArray(initialTags)
    ? initialTags
    : Array.isArray(ctxTags)
    ? ctxTags
    : [];

  const STORAGE_KEY = "lynkr_disabled_tags";

  const [query, setQuery] = useState("");
  const [tags, setTags] = useState([]);

  // derived visible tags
  const visibleTags = useMemo(() => {
    const disabledIds = new Set((disabledTags || []).map((d) => d.id));
    return allTags.filter((t) => !disabledIds.has(t.id));
  }, [allTags, disabledTags]);

  // sync localStorage whenever disabledTags change
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
  }, []);
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
  // helper: toggle a tag disabled/enabled
  const toggleTag = (tag) => {
    if (!tag || !tag.id) return;
    const exists = disabledTags.find((d) => d.id === tag.id);
    if (exists) {
      // enable it
      const next = disabledTags.filter((d) => d.id !== tag.id);
      setDisabledTags(next);
    } else {
      // disable it (append)
      const next = [...disabledTags, { id: tag.id, label: tag.label }];
      setDisabledTags(next);
    }
  };
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

  const disableAll = () => {
    const next = allTags.map((t) => ({ id: t.id, label: t.label }));
    setDisabledTags(next);
  };

const enableAll = () => {
  if (!disabledTags.length) return;

  // Create the next enabled tag list (combine current + all disabled)
  const nextTags = [...tags, ...disabledTags];

  // Clear disabled tags
  const nextDisabled = [];

  // Update state
  setTags(nextTags);
  setDisabledTags(nextDisabled);

  // Trigger external updates
  onChange(nextTags);

  // Close dropdown if present
  if (typeof setShowDropdown === "function") setShowDropdown(false);

  // Sync to localStorage
  try {
    localStorage.setItem("lynkr_disabled_tags", JSON.stringify(nextDisabled));
  } catch (err) {
    console.warn("Failed to write disabled tags:", err);
  }
};


    return (
      <div className="disable-tags-container">
        <div
          className="disable-tags"
          role="region"
          aria-label="Disable tags manager"
        >
          <div className="dt-header">
            {/* <div className="dt-search">
          <FiSearch className="dt-search-icon" />
          <input
            className="dt-search-input"
            placeholder="Search tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tags"
          />
          {query && (
            <button
              className="dt-clear"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <FiX />
            </button>
          )}
        </div> */}

            <div className="dt-actions">
              {/* <button
            className="dt-action dt-btn disable-all"
            onClick={disableAll}
            title="Disable all tags"
          >
            <FiSlash /> Disable all
          </button> */}
              <button
                className="dt-action dt-btn enable-all"
                onClick={enableAll}
                title="Enable all tags"
              >
                <FiCheck /> Enable all
              </button>
              <button
                className="cut-btn"
                onClick={onClick}
                aria-label="Close disabled tags panel"
                title="Close disabled tags panel"
              >
                <FiX />
              </button>
            </div>
          </div>

          <div className="dt-list" role="list">
            {disabledTags.length === 0 ? (
              <div className="dt-empty">No tags found</div>
            ) : (
              disabledTags.map((t) => {
                const isDisabled = !!disabledTags.find((d) => d.id === t.id);
                return (
                  <div
                    key={t.id}
                    className={`dt-item ${isDisabled ? "disabled" : "enabled"}`}
                    role="listitem"
                    aria-pressed={isDisabled}
                  >
                    <div className="dt-item-left">
                      <div className="dt-tag-label">{t.label}</div>
                      <div className="dt-tag-meta">
                        {/* optional extra meta */}
                      </div>
                    </div>

                    <div className="dt-item-right">
                      <button
                        className={`dt-toggle ${isDisabled ? "on" : "off"}`}
                        onClick={() => enableTag(t.id)}
                        aria-label={`${isDisabled ? "Enable" : "Disable"} ${
                          t.label
                        }`}
                      >
                        {isDisabled ? (
                          <span className="dt-toggle-on">
                            <FiCheck />
                          </span>
                        ) : (
                          <span className="dt-toggle-off">
                            <FiSlash />
                          </span>
                        )}
                        <span className="dt-toggle-text">
                          {isDisabled ? "Enable" : "Disable"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="dt-footer">
            {/* <div className="dt-stats">
          Visible: <strong>{visibleTags.length}</strong> / {tags.length} tags
        </div> */}
          </div>
        </div>
      </div>
    );
}
