import React from "react";
import "../CSS/Analytics.css";
import "../CSS/AnalyticsLists.css";
import { FiTrendingUp } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";

/**
 * Props:
 * - items: [{ id, title, url, clicks, lastAccessed }]
 */
export default function MostVisited() {
  const context = React.useContext(UrlContext);
  const { updateClickCount, filtered } =
    context;
  const list = filtered.length
    ? filtered
        .filter((item) => item.url_clicks > 0 && item.status === "active")
        .sort((a, b) => b.url_clicks - a.url_clicks)
        .slice(0, 3)
    : [];

  return (
    <section className="analytics-section">
      <div className="section-head">
        <h3>
          <FiTrendingUp className="section-icon" /> Most Visited URLs
        </h3>
      </div>

      <div className="most-visited-list">
        {list.length > 0 ? (
          list.map((it, idx) => (
            <div className="mv-row" key={it.id}>
              <div className="mv-left">
                <div className="mv-rank">{idx + 1}</div>
                <div className="mv-meta">
                  <div className="mv-title">{it.title}</div>
                  <a
                    className="mv-url"
                    onClick={() => updateClickCount(it.id)}
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {it.url}
                  </a>
                </div>
              </div>

              <div className="mv-right">
                <div className="mv-clicks">
                  {it.url_clicks} <span className="muted">clicks</span>
                </div>
                <div className="mv-last muted">
                  Last: {it.formatted_updated_at}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-analytics">
            <p>No links visited yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
