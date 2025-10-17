import React, { useEffect, useMemo, useState } from "react";
import { FiHash, FiClock, FiTag, FiLoader } from "react-icons/fi";
import "./CSS/Tags.css";
import UrlContext from "../context/url_manager/UrlContext";

export default function Tags() {
  const context = React.useContext(UrlContext);
  const { filtered, setUrls, getAllUrls } = context;
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // define async function inside useEffect
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls(); // call API function
        console.log("✅ API Response:", res.data); // full response object
        setUrls(res.data); // save to state
      } catch (err) {
        console.error("❌ Error fetching URLs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls(); // call it
  }, []);
  // Extract tags from filtered URLs
  const tags = useMemo(() => {
    setLoading(true);
    try {
      const tagMap = {};
      filtered.forEach(url => {
        if (url.tags && Array.isArray(url.tags)) {
          url.tags.forEach(tag => {
            if (!tagMap[tag]) {
              tagMap[tag] = {
                name: tag,
                count: 1,
                lastActive: url.updated_at || new Date().toISOString()
              };
            } else {
              tagMap[tag].count++;
              // Update lastActive if this URL is more recent
              if (url.updated_at && (!tagMap[tag].lastActive || new Date(url.updated_at) > new Date(tagMap[tag].lastActive))) {
                tagMap[tag].lastActive = url.updated_at;
              }
            }
          });
        }
      });
      setLoading(false);
      return Object.values(tagMap);
    } catch (err) {
      console.error("Error processing tags:", err);
      setLoading(false);
      return [];
    }
  }, [filtered]);

  // compute stats and cloud sizes
  const stats = useMemo(() => {
    const total = tags.reduce((s, t) => s + t.count, 0);
    const max = tags.length ? Math.max(...tags.map((t) => t.count)) : 1;
    const min = tags.length ? Math.min(...tags.map((t) => t.count)) : 1;
    return { total, max, min };
  }, [tags]);

  // scale function for font-size (returns px)
  const scaleSize = (count) => {
    const minSize = 14;
    const maxSize = 48;
    if (stats.max === stats.min) return Math.round((minSize + maxSize) / 2);
    const t = (count - stats.min) / (stats.max - stats.min);
    return Math.round(minSize + t * (maxSize - minSize));
  };

  // most used sorted
  const mostUsed = [...tags].sort((a, b) => b.count - a.count);

  // recent activity sorted by lastActive
  const recent = [...tags].sort(
    (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
  );

  // Show loading state while processing tags
  if (loading) {
    return (
      <div className="sugg-root">
        <div className="sugg-clean">
          <div className="sugg-icon loading-icon">
            <FiLoader />
          </div>
          <h3>Loading Tags...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="tags-root">
      <div className="tags-header">
        <div className="tags-title">
          <FiTag className="tags-icon" />

          <h3>Tag Overview</h3>
          <span className="tag-count">{tags.length} total tags</span>
        </div>
      </div>

      <div className="tags-card">
        {/* Tag Cloud */}
        <div className="tag-cloud-section">
          <h4 className="section-title">Tag Cloud</h4>

          {tags.length === 0 ? (
            <div className="tag-cloud-empty">
              <FiHash className="empty-hash" />
              <p>No tags yet. Start adding tags to your URLs!</p>
            </div>
          ) : (
            <div className="tag-cloud">
              {tags.map((t) => (
                <button
                  key={t.name}
                  className="tag-pill"
                  style={{ fontSize: `${scaleSize(t.count)}px` }}
                  title={`${t.name} — ${t.count} url(s)`}
                >
                  #{t.name}
                  <span className="tag-bubble">{t.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row with Most Used & Recently Active */}
        <div className="tags-bottom">
          <div className="most-used">
            <h4 className="section-title">Most Used Tags</h4>
            {mostUsed.length === 0 ? (
              <div className="empty-line">No tags available</div>
            ) : (
              <ul className="most-list">
                {mostUsed.map((t, idx) => (
                  <li key={t.name} className="most-item">
                    <div className="rank">#{idx + 1}</div>
                    <div className="tag-info">
                      <div className="tag-name">#{t.name}</div>
                      <div className="tag-meta">
                        <span className="meta-count">
                          {t.count} URL{t.count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="right-badge">
                      +{Math.max(0, t.count - 1)} this week
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="recent-active">
            <h4 className="section-title">Recently Active</h4>
            {recent.length === 0 ? (
              <div className="empty-line">No recent activity</div>
            ) : (
              <ul className="recent-list">
                {recent.map((t) => (
                  <li key={t.name} className="recent-item">
                    <div className="ra-left">
                      <FiHash className="ra-icon" />
                      <div>
                        <div className="ra-tag">#{t.name}</div>
                        <div className="ra-date">{t.lastActive}</div>
                      </div>
                    </div>
                    <div className="ra-count">{t.count} URLs</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
