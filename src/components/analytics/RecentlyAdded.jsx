import React from "react";
import "../CSS/AnalyticsLists.css";
import { FiX, FiCalendar } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";

/**
 * Props:
 * - items: [{ id, title, url, tags:[], added }]
 */
export default function RecentlyAdded() {
  const context = React.useContext(UrlContext);
  const { updateClickCount, filtered } = context;
  const list = filtered.length
    ? filtered
        .filter(item => item.status === "active")
        .sort((a, b) => new Date(b.added) - new Date(a.added))
        .slice(0, 3)
    : [
        
      ];

  return (
    <section className="analytics-section">
      <div className="section-head">
        <h3>
          {" "}
          <FiCalendar className="date-icon" />
          Recently Added URLs
        </h3>
      </div>

      <div className="recent-analytics-list">
        {list.length > 0 ? (
          list.map((it) => (
            <div className="recent-row" key={it.id}>
              <div className="recent-left">
                <div className="recent-title">{it.title}</div>
                <a
                  onClick={() => updateClickCount(it.id)}
                  className="recent-url"
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {it.url}
                </a>
                <div className="recent-tags">
                  {(it.tags || []).map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="recent-right muted">{it.formatted_created_at}</div>
            </div>
          ))
        ) : (
          <div className="empty-analytics">
            <p>No links added yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
