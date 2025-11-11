import React, { useEffect, useMemo, useState, useContext, use } from "react";
import { FiHash, FiTag, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import "./CSS/Tags.css";
import UrlContext from "../context/url_manager/UrlContext";
import NeonOrbitalLoader from "./NeonOrbitalLoader";
import AddTagModal from "./dashboard/tags/AddTagModal";

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
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const {
    filtered,
    setUrls,
    getAllUrls,
    setScreenLoading,
    addTag,
    userTags,
    setUserTags,
    getTags,
    showNotify,
  } = useContext(UrlContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls();
        const tags = await getTags();
        // console.log("✅ API Response:", res?.data);
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

async function handleAddTag(tag) {
  const result = await addTag(tag);

  if (!result) {
    showNotify("error", "No response from addTag");
    return { success: false, message: "No response" };
  }

  if (result.success) {
    // normalize helper: supports string | {tag} | {name}
    const getVal = (i) => (i?.tag ?? i?.name ?? i).toString().trim();
    const newItem = result.tag ?? { id: null, tag };

    setUserTags((prev = []) => {
      const already = prev.some(
        (p) => getVal(p).toLowerCase() === getVal(newItem).toLowerCase()
      );
      if (already) return prev;
      return [newItem, ...prev]; // prepend so user sees it at top
    });

    showNotify("success", "Tag added successfully!");
  } else {
    showNotify("error", result.message || "Failed to add tag");
  }

  return result;
}


  // derive tags from filtered without side-effects
  const tags = useMemo(() => {
    try {
      const tagMap = {};
      (filtered || []).forEach((url) => {
        if (!url || !url.tags || !Array.isArray(url.tags)) return;
        const isoCandidate = url.updated_at || url.updated_at_iso || null;
        const altFormatted = url.formatted_updated_at || null;

        url.tags.forEach((tag) => {
          if (!tag) return;
          const parsedISO = isoCandidate ? new Date(isoCandidate) : null;
          const lastActiveISO =
            parsedISO && !isNaN(parsedISO) ? parsedISO.toISOString() : null;
          const lastActiveFormatted = altFormatted
            ? altFormatted
            : lastActiveISO
            ? formatDate(lastActiveISO)
            : null;

          if (!tagMap[tag]) {
            tagMap[tag] = {
              name: tag,
              count: 1,
              lastActiveISO,
              lastActiveFormatted,
            };
          } else {
            tagMap[tag].count++;
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

  const stats = useMemo(() => {
    const total = tags.reduce((s, t) => s + (t.count || 0), 0);
    const counts = tags.map((t) => t.count || 0);
    const max = counts.length ? Math.max(...counts) : 1;
    const min = counts.length ? Math.min(...counts) : 1;
    return { total, max, min };
  }, [tags]);

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

  // helper to remove a user tag locally (assumes server call exists elsewhere)
  const handleRemoveUserTag = (tagName) => {
    setUserTags((prev) =>
      prev.filter((t) => (t.tag || t.name || t) !== tagName)
    );
    showNotify("success", `Tag \"${tagName}\" removed`);
  };

  if (loading) return <NeonOrbitalLoader />;

  return (
    <div className="tags-root">
      {showAddTagModal && (
        <AddTagModal
          existingTags={(userTags || []).map((t) => t.tag || t.name || t)}
          onClose={() => setShowAddTagModal(false)}
          onAdd={handleAddTag}
        />
      )}

      <div className="tags-inner-root">
        <div className="tags-header">
          <div className="flex items-center gap-3 justify-between">
            <div className="tags-title">
              <FiTag className="tags-icon" />
              <h3>Tag Overview</h3>
              <span className="tag-count">{tags.length} derived tags</span>
            </div>

            <div className="header-actions">
              <button
                className="add-tag-btn"
                onClick={() => setShowAddTagModal(true)}
              >
                <FiPlus /> Add Tag
              </button>
            </div>
          </div>
        </div>

        <div className="tags-card two-column">
          {/* Right column: User's custom tags (userTags from context) */}
          <div className="user-tags-section">
            <h4 className="section-title">Your Tags</h4>

            {!userTags || userTags.length === 0 ? (
              <div className="user-tags-empty">
                <p>You haven't created any custom tags yet.</p>
                <button
                  className="add-tag-btn small"
                  onClick={() => setShowAddTagModal(true)}
                >
                  <FiPlus /> Create your first tag
                </button>
              </div>
            ) : (
              <div className="user-tags-list">
                {userTags.map((ut) => {
                  const name = ut.tag || ut.name || ut;
                  const derivedInfo = tags.find((x) => x.name === name);
                  return (
                    <div className="user-tag-row" key={name}>
                      <div className="user-tag-main">
                        <div className="user-tag-name">{name}</div>
                        <div className="user-tag-meta">
                          <span>
                            {derivedInfo
                              ? `${derivedInfo.count} URLs`
                              : "0 URLs"}
                          </span>
                          <span className="dot">•</span>
                          <span>
                            {derivedInfo
                              ? derivedInfo.lastActiveFormatted
                              : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="user-tag-actions">
                        <button className="icon-btn" title="Edit">
                          <FiEdit />
                        </button>
                        <button
                          className="icon-btn"
                          title="Remove"
                          onClick={() => handleRemoveUserTag(name)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Left column: Tag Cloud (derived from URLs) */}
          <div className="tag-cloud-section">
            <h4 className="section-title">Tag Cloud</h4>

            {tags.length === 0 ? (
              <div className="tag-cloud-empty">
                <FiHash className="empty-hash" />
                <p>No tags found from saved URLs.</p>
              </div>
            ) : (
              <div className="tag-cloud">
                {tags.map((t) => (
                  <button
                    key={t.name}
                    className="tag-pill"
                    title={`${t.name} — ${t.count} url(s)`}
                    // style={{ fontSize: `${scaleSize(t.count)}px` }}
                    aria-label={`Tag ${t.name}, ${t.count} URLs`}
                  >
                    {t.name}
                    <span className="tag-bubble">{t.count}</span>
                  </button>
                ))}
              </div>
            )}
{/* 
            <div className="tag-stats">
              <div>Total tagged URLs: {stats.total}</div>
              <div>Most used: {mostUsed[0]?.name ?? "—"}</div>
              <div>Recent active: {recent[0]?.name ?? "—"}</div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
