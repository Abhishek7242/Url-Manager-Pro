import React, { useRef, useEffect, useState } from "react";
import {
  FiExternalLink,
  FiShare2,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import "../CSS/LinkCard.css";
import UrlContext from "../../context/url_manager/UrlContext";

export default function LinkCard({
  link,
  selected,
  activeMode,
  onSelect = () => {},
  onShare = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const moreBtnRef = useRef(null);
  const context = React.useContext(UrlContext);
  const {
    deleteUrlPost,
    setUrls,
    showNotify,
    updateClickCount,
    formData,
    setFormData,
    isEditOpen,
    setIsEditOpen,
  } = context;

  useEffect(() => {
    // close menu on outside click
    function handleOutside(e) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !moreBtnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }

    // close on escape
    function handleEsc(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  // Selection is now handled by the parent component

  const onEdit = (link) => {
    setFormData({
      id: link.id,
      title: link.title,
      url: link.url,
      note: link.note || "",
      tags: (link.tags || []).join(", "),
    });
  };
  // Selection is now handled by the parent component via onSelect prop
  // keyboard toggle for button
  function handleMoreKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMenuOpen((v) => !v);
    }
  }
  const onDelete = (id) => {
    let res = deleteUrlPost(id);
    if (res) {
      showNotify("success", "URL deleted successfully!");
    }

    setUrls((prev) => prev.filter((x) => x.id !== id));
  };
  return (
    <div className={`link-card ${activeMode} ${selected ? "selected" : ""}`}>
      <div className="card-top">
        <input
          type="checkbox"
          checked={!!selected}
          onChange={(e) => onSelect(link.id, e.target.checked)}
        />
        <h3 className="card-title">{link.title}</h3>

        {/* right corner icons (hidden until hover) */}
        <div className="card-actions" aria-hidden={menuOpen ? "false" : "true"}>
          <button
            className="icon-btn share-btn"
            title="Share URL"
            onClick={() => onShare(link)}
            aria-label={`Share ${link.title}`}
          >
            <FiShare2 />
          </button>

          <div className="more-wrapper">
            <button
              ref={moreBtnRef}
              className="icon-btn more-btn"
              title="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              onKeyDown={handleMoreKey}
            >
              <FiMoreVertical />
            </button>

            {/* menu */}
            {menuOpen && (
              <div
                className="more-menu"
                ref={menuRef}
                role="menu"
                aria-label="Link actions"
              >
                <button
                  className="menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditOpen(true);
                    onEdit(link);
                  }}
                >
                  <FiEdit2 className="mi-icon" /> Edit
                </button>

                <button
                  className="menu-item danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(link.id);
                  }}
                >
                  <FiTrash2 className="mi-icon" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        <a
          className="card-url"
          href={link.url}
          onClick={() => updateClickCount(link.id)}
          target="_blank"
          rel="noreferrer"
        >
          <span title={link.url}>
            {link.url.length > 20 ? link.url.slice(0, 15) + "..." : link.url}
          </span>
          <FiExternalLink />
        </a>

        {link.note && <p className="card-note">{link.note}</p>}

        <div className="card-meta">
          <div className="tags">
            {(link.tags || []).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>

          <div className="dates">
            <div className="added">Added {link.formatted_created_at}</div>
            {link.lastAccessed && (
              <div className="accessed">Last accessed {link.lastAccessed}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
