import React, { useEffect, useRef, useContext } from "react";
import "../CSS/AddTagsLinksModal.css";
import UrlContext from "../../context/url_manager/UrlContext";
import EditUrlModal from "../dashboard/EditUrlModal";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - links: array of { id, title, description, url, date } (date as ISO string or Date)
 *
 * Example link item:
 * { id: 1, title: 'Example', description: 'A short desc', url: 'https://example.com', date: '2025-10-17' }
 */
export default function AddTagsLinksModal({
  isOpen = false,
  onClose = () => {},
  links = [],
}) {
  const modalRef = useRef(null);
  const { setFormData, setIsEditOpen } = useContext(UrlContext);

  useEffect(() => {
    function onKey(e) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // close when clicking outside
  useEffect(() => {
    function onClick(e) {
      if (!isOpen) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (d) => {
    try {
      const dt = d ? new Date(d) : new Date();
      return dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // lightweight UI feedback: temporary title attribute change could be added by the caller
      // but we keep this component simple.
      // You can integrate a toast or small inline message if preferred.
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div
      className="atl-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Add tags and links modal"
    >
      <div className="atl-container" ref={modalRef}>
        <div className="atl-header">
          <div>
            <h2 className="atl-title">Links & Related Data</h2>
            <p className="atl-sub">
              Review links, open them, copy URLs, or remove entries.
            </p>
          </div>
          <button
            className="atl-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="atl-body">
          <div className="atl-grid">
            {links.length === 0 && (
              <div className="atl-empty">
                No links yet — add one to get started.
              </div>
            )}

            {links.map((link) => (
              <article className="atl-card" key={link.id ?? link.url}>
                <div className="atl-card-head">
                  <h3 className="atl-card-title">
                    {link.title || "Untitled link"}
                  </h3>
                  <time className="atl-card-date" dateTime={link.date || ""}>
                    {formatDate(link.date)}
                  </time>
                </div>

                <p className="atl-card-desc">
                  {link.description || "No description provided."}
                </p>

                <div className="atl-card-footer">
                  <a
                    className="atl-link"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.url}
                  >
                    {link.url}
                  </a>

                  <div className="atl-actions">
                    <button
                      className="atl-action-btn"
                      onClick={() => {
                        setFormData({
                          id: link.id,
                          title: link.title,
                          url: link.url,
                          note: link.note || "",
                          tags: (link.tags || []).join(", "),
                        });
                        setIsEditOpen(true);
                        onClose(); // Close the current modal
                      }}
                      title="Edit Url"
                      aria-label={`Edit ${link.title || link.url}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
