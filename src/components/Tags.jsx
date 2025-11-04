import React, { useEffect, useMemo, useState, useContext } from "react";
import { FiHash, FiTag } from "react-icons/fi";
import "./CSS/Tags.css";
import UrlContext from "../context/url_manager/UrlContext";
import NeonOrbitalLoader from "./NeonOrbitalLoader";

function formatDate(isoOrDate) {
  if (!isoOrDate) return "—";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (!(d instanceof Date) || isNaN(d)) return "—";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mm = months[d.getUTCMonth()];
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm} ${dd}, ${yyyy}`;
}

export default function Tags() {
  const { filtered, setUrls, getAllUrls, setScreenLoading } =
    useContext(UrlContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls();
        console.log("✅ API Response:", res?.data);
        if (res?.data) setUrls(res.data);
      } catch (err) {
        console.error("❌ Error fetching URLs:", err);
      } finally {
        setLoading(false);
        setScreenLoading(false);
      }
    };
    fetchUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derive tags from filtered without side-effects
  const tags = useMemo(() => {
    try {
      const tagMap = {};
      (filtered || []).forEach((url) => {
        if (!url || !url.tags || !Array.isArray(url.tags)) return;
        // prefer updated_at ISO if available, otherwise try formatted_updated_at (which might already be formatted)
        // we'll normalize to an ISO for sorting (if possible), and keep a formatted string for display
        const isoCandidate = url.updated_at || url.updated_at_iso || null;
        const altFormatted = url.formatted_updated_at || null;

        url.tags.forEach((tag) => {
          if (!tag) return;
          // compute an ISO date for comparison; if none, keep null
          const parsedISO = isoCandidate ? new Date(isoCandidate) : null;
          // If parsedISO invalid, try to parse altFormatted (best-effort)
          const lastActiveISO =
            parsedISO && !isNaN(parsedISO) ? parsedISO.toISOString() : null;

          // display date preference: if the URL already provides formatted_updated_at use it,
          // otherwise format from lastActiveISO
          const lastActiveFormatted = altFormatted
            ? altFormatted
            : lastActiveISO
            ? formatDate(lastActiveISO)
            : null;

          if (!tagMap[tag]) {
            tagMap[tag] = {
              name: tag,
              count: 1,
              lastActiveISO, // for sorting
              lastActiveFormatted,
            };
          } else {
            tagMap[tag].count++;
            // Update lastActiveISO and formatted if this url is more recent
            if (lastActiveISO) {
              const existingISO = tagMap[tag].lastActiveISO
                ? new Date(tagMap[tag].lastActiveISO)
                : new Date(0);
              const candidate = new Date(lastActiveISO);
              if (candidate > existingISO) {
                tagMap[tag].lastActiveISO = lastActiveISO;
                tagMap[tag].lastActiveFormatted =
                  lastActiveFormatted || formatDate(lastActiveISO);
              }
            } else if (!tagMap[tag].lastActiveISO && lastActiveFormatted) {
              // If we don't yet have any ISO but there is a formatted date available, keep it
              tagMap[tag].lastActiveFormatted =
                tagMap[tag].lastActiveFormatted || lastActiveFormatted;
            }
          }
        });
      });
      return Object.values(tagMap);
    } catch (err) {
      console.error("Error processing tags:", err);
      return [];
    }
  }, [filtered]);

  // stats
  const stats = useMemo(() => {
    const total = tags.reduce((s, t) => s + (t.count || 0), 0);
    const counts = tags.map((t) => t.count || 0);
    const max = counts.length ? Math.max(...counts) : 1;
    const min = counts.length ? Math.min(...counts) : 1;
    return { total, max, min };
  }, [tags]);

  // responsive scale for tag font-size
  const scaleSize = (count) => {
    let minSize = 14;
    let maxSize = 48;
    if (typeof window !== "undefined") {
      const w = window.innerWidth;
      if (w <= 280) {
        minSize = 11;
        maxSize = 26;
      } else if (w <= 360) {
        minSize = 12;
        maxSize = 28;
      } else if (w <= 420) {
        minSize = 13;
        maxSize = 32;
      } else if (w <= 768) {
        minSize = 14;
        maxSize = 36;
      }
    }
    if (stats.max === stats.min) return Math.round((minSize + maxSize) / 2);
    const t = (count - stats.min) / (stats.max - stats.min || 1);
    return Math.round(minSize + t * (maxSize - minSize));
  };

  const mostUsed = useMemo(
    () => [...tags].sort((a, b) => (b.count || 0) - (a.count || 0)),
    [tags]
  );
  const recent = useMemo(
    () =>
      [...tags].sort((a, b) => {
        const da = a.lastActiveISO ? new Date(a.lastActiveISO) : new Date(0);
        const db = b.lastActiveISO ? new Date(b.lastActiveISO) : new Date(0);
        return db - da;
      }),
    [tags]
  );

  if (loading) return <NeonOrbitalLoader />;

  return (
    <div className="tags-root">
      <div className="tags-inner-root">
        <div className="tags-header">
          <div className="tags-title">
            <FiTag className="tags-icon" />
            <h3>Tag Overview</h3>
            <span className="tag-count">{tags.length} total tags</span>
          </div>
        </div>

        <div className="tags-card">
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
                    title={`${t.name} — ${t.count} url(s)`}
                    aria-label={`Tag ${t.name}, ${t.count} URLs`}
                  >
                    {t.name}
                    <span className="tag-bubble">{t.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="tags-bottom">
            <div className="most-used">
              <h4 className="section-title">Most Used Tags</h4>
              {mostUsed.length === 0 ? (
                <div className="empty-line">No tags available</div>
              ) : (
                <ul className="most-list">
                  {mostUsed.map((t, idx) => (
                    <li key={t.name} className="most-item">
                      <div className="rank">{idx + 1}</div>
                      <div className="tag-info">
                        <div className="tag-name">{t.name}</div>
                        <div className="tag-meta">
                          <span className="meta-count">
                            {t.count} URL{t.count > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="right-badge">
                        +{Math.max(0, t.count)} this week
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
                          <div className="ra-tag">{t.name}</div>
                          <div className="ra-date">
                            {t.lastActiveFormatted || "—"}
                          </div>
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
    </div>
  );
}
