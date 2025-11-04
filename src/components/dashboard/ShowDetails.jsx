import React from "react";
import "../CSS/ShowDetails.css";

export default function ShowDetails({
  item = {},
  onEdit,
  onDelete,
  onClose,
  openInNewTab = true,
}) {
  if (!item) return null;

  const { title, desc, url, tags, reminder } = item;

  function formatReminder(r) {
    if (!r) return null;
    const d = r instanceof Date ? r : new Date(r);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const formattedReminder = formatReminder(reminder);

  return (
    <div className="showdetails-overlay">
      <div
        className="showdetails-card"
        role="dialog"
        aria-labelledby="sd-title"
      >
        <div className="showdetails-header">
          <h2 id="sd-title" className="showdetails-title">
            {title || "Untitled"}
          </h2>

          <div className="showdetails-actions" aria-hidden>
            {/* {onEdit && (
              <button
                type="button"
                className="showdetails-btn showdetails-btn-edit"
                onClick={() => onEdit(item)}
                title="Edit"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="showdetails-btn showdetails-btn-delete"
                onClick={() => onDelete(item)}
                title="Delete"
              >
                Delete
              </button>
            )} */}
            {onClose && (
              <button
                type="button"
                className="showdetails-btn showdetails-btn-close"
                onClick={onClose}
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div
          className="showdetails-section showdetails-desc"
          aria-label="Description"
        >
          <div className="showdetails-section-title">Description</div>
          <div className="showdetails-desc-text">
            {desc && desc.trim().length > 0 ? desc : "No description added"}
          </div>
        </div>

        {/* Link */}
        {url && (
          <div
            className="showdetails-section showdetails-link"
            aria-label="Link"
          >
            <div className="showdetails-section-title">Link</div>
            <a
              href={url}
              className="showdetails-link-anchor"
              target={openInNewTab ? "_blank" : "_self"}
              rel={openInNewTab ? "noopener noreferrer" : undefined}
            >
              {url}
            </a>
          </div>
        )}

        {/* Tags */}
        {Array.isArray(tags) && tags.length > 0 && (
          <div
            className="showdetails-section showdetails-tags"
            aria-label="Tags"
          >
            <div className="showdetails-section-title">Tags</div>
            <div className="showdetails-tags-wrap">
              {tags.map((t, i) => (
                <span key={i} className="showdetails-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reminder */}
        {formattedReminder && (
          <div
            className="showdetails-section showdetails-reminder"
            aria-label="Reminder"
          >
            <div className="showdetails-section-title">Reminder</div>
            <div className="showdetails-reminder-text">{formattedReminder}</div>
          </div>
        )}
      </div>
    </div>
  );
}
