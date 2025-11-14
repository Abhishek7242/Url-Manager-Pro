import React, { useEffect, useMemo, useState, useContext } from "react";
import { FiHash, FiTag, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { Icon } from "@iconify/react";
import "./CSS/Tags.css";
import UrlContext from "../context/url_manager/UrlContext";
import NeonOrbitalLoader from "./NeonOrbitalLoader";
import AddTagModal from "./dashboard/tags/AddTagModal";
import EditTagModal from "./dashboard/tags/EditTagModal"; // <-- new

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
  const [editingTag, setEditingTag] = useState(null); // <-- new: current tag being edited

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
    updateTag,
    deleteTag, // optional; if your UrlContext exposes updateTag/use it
    user, // <-- added: will gate Add/Edit/Delete UI (ensure this matches your UrlContext)
  } = useContext(UrlContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls();
        const tags = await getTags();
        if (res?.data) setUrls(res.data);
      } catch (err) {
        console.error("❌ Error fetching URLs:", err);
      } finally {
        setLoading(false);
        setScreenLoading(false);
      }
    };
    fetchUrls();
  }, []);

  async function handleAddTag(emoji, tag) {
    const result = await addTag(emoji, tag);

    if (!result) {
      showNotify("error", "No response from addTag");
      return { success: false, message: "No response" };
    }

    if (result.success) {
      const getVal = (i) => (i?.tag ?? i?.name ?? i).toString().trim();
      const newItem = result.tag ?? { id: null, tag };

      setUserTags((prev = []) => {
        const already = prev.some(
          (p) => getVal(p).toLowerCase() === getVal(newItem).toLowerCase()
        );
        if (already) return prev;
        return [newItem, ...prev];
      });

      showNotify("success", "Tag added successfully!");
    } else {
      showNotify("error", result.message || "Failed to add tag");
    }

    return result;
  }

  // ✅ Helper: return user icon (emoji) or default system icon
  const getIconForTag = (name = "") => {
    if (!name) return "";

    const normalizedName = name.toString().trim().toLowerCase();

    // Find user-defined tag record
    const ut = (userTags || []).find((u) => {
      const candidate = (u?.tag ?? u?.name ?? u)
        .toString()
        .trim()
        .toLowerCase();
      return candidate === normalizedName;
    });

    const userIcon = ut?.icon;

    if (userIcon && userIcon !== "null" && userIcon !== "undefined") {
      return userIcon;
    }

    switch (normalizedName) {
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
  async function handleRemoveUserTag(tagItem) {
    try {
      const id = tagItem?.id ?? null;
      const tagName = tagItem?.tag || tagItem?.name || tagItem;

      if (!id) {
        showNotify("error", `Tag "${tagName}" has no valid ID.`);
        return;
      }

      const confirmDelete = window.confirm(`Delete tag "${tagName}"?`);
      if (!confirmDelete) return;

      const result = await deleteTag(id);

      if (!result || result.success !== true) {
        showNotify("error", result?.message || "Failed to delete tag");
        return;
      }

      // ✅ remove tag from local state
      setUserTags((prev) => prev.filter((t) => t.id !== id));

      showNotify("success", `Tag "${tagName}" deleted successfully!`);
    } catch (err) {
      console.error("❌ handleRemoveUserTag error:", err);
      showNotify("error", err?.message || "Network error while deleting tag");
    }
  }

  // open edit modal for a user tag
  const handleEditClick = (ut) => {
    // ut may be string or object
    const tagObj =
      typeof ut === "string" ? { id: null, tag: ut, icon: "" } : ut ?? {};
    setEditingTag(tagObj);
  };

  // save handler passed to EditTagModal
  const handleSaveTag = async (id, icon, tag) => {
    // console.log("handleSaveTag called with:", { id, icon, tag });
    // Prefer context.updateTag if provided
    try {
      let result = null;
      if (typeof updateTag === "function") {
        // assume updateTag returns { success, tag }
        result = await updateTag(id, icon, tag);
      } else {
        // fallback: call API directly (adjust path if your API base differs)
        const payload = { tag, icon };
        const res = await fetch(`/user/tags/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          result = {
            success: false,
            message: data?.message || `Request failed (${res.status})`,
          };
        } else {
          // Laravel controller returns { success: true, data: <tag> }
          result = { success: true, tag: data?.data ?? data?.tag ?? null };
        }
      }

      if (!result || result.success !== true) {
        showNotify("error", result?.message || "Failed to update tag");
        return result;
      }

      // Update local userTags list: replace existing item by id or tag name
      setUserTags((prev = []) => {
        const normalizedNew = (tag ?? "").toString().trim();
        const foundIndex = prev.findIndex((p) => {
          const pid = p?.id ?? null;
          if (id && pid) return pid === id;
          // fallback compare by name
          const candidate = (p?.tag ?? p?.name ?? p).toString().trim();
          return (
            candidate.toLowerCase() === (normalizedNew || "").toLowerCase()
          );
        });

        const updatedItem = result.tag ?? {
          id: id ?? null,
          tag: normalizedNew,
          icon,
        };

        if (foundIndex === -1) {
          // prepend new if not found
          return [updatedItem, ...prev];
        } else {
          const next = [...prev];
          next[foundIndex] = { ...next[foundIndex], ...updatedItem };
          return next;
        }
      });

      showNotify("success", "Tag updated.");
      setEditingTag(null);
      return { success: true };
    } catch (err) {
      console.error("save tag failed:", err);
      showNotify("error", err?.message || "Could not save tag.");
      return { success: false, message: err?.message || "Could not save tag." };
    }
  };

  // cancel editing
  const handleEditCancel = () => setEditingTag(null);

  if (loading) return <NeonOrbitalLoader />;

  return (
    <div className="tags-root">
      {showAddTagModal && user && (
        <AddTagModal
          existingTags={(userTags || []).map((t) => t.tag || t.name || t)}
          onClose={() => setShowAddTagModal(false)}
          onAdd={handleAddTag}
        />
      )}

      {editingTag && user && (
        <EditTagModal
          tagItem={editingTag}
          existingTags={(userTags || []).map((t) => t.tag || t.name || t)}
          onClose={handleEditCancel}
          onSave={handleSaveTag}
          closeOnSuccess={true}
        />
      )}

      <div className="tags-inner-root">
        <div className="tags-header">
          <div className="flex items-center gap-3 flex-wrap justify-between">
            <div className="tags-title">
              <FiTag className="tags-icon" />
              <h3>Tag Overview</h3>
              <span className="tag-count">{tags.length} derived tags</span>
            </div>

            <div className="header-actions">
              {user && (
                <button
                  className="add-tag-btn"
                  onClick={() => setShowAddTagModal(true)}
                >
                  <FiPlus /> Add Tag
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="tags-card two-column">
          {/* Right column: User's custom tags */}
          <div className="user-tags-section">
            <h4 className="section-title">Your Tags</h4>

            {!userTags || userTags.length === 0 ? (
              <div className="user-tags-empty">
                <p>You haven't created any custom tags yet.</p>
                {user && (
                  <button
                    className="add-tag-btn small"
                    onClick={() => setShowAddTagModal(true)}
                  >
                    <FiPlus /> Create your first tag
                  </button>
                )}
              </div>
            ) : (
              <div className="user-tags-list">
                {userTags.map((ut) => {
                  const name = ut.tag || ut.name || ut;
                  const derivedInfo = tags.find((x) => x.name === name);
                  return (
                    <div className="user-tag-row" key={name}>
                      <div className="user-tag-main">
                        <div className="user-tag-name">
                          <span className="tag-icon" aria-hidden>
                            {getIconForTag(name)}
                          </span>
                          {name}
                        </div>
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
                        {user && (
                          <>
                            <button
                              className="icon-btn"
                              title="Edit"
                              onClick={() => handleEditClick(ut)} // <-- wired
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="icon-btn"
                              title="Remove"
                              onClick={() => handleRemoveUserTag(ut)} // pass full object, not just name
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Left column: Tag Cloud */}
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
                    aria-label={`Tag ${t.name}, ${t.count} URLs`}
                  >
                    <span className="tag-pill-icon" aria-hidden>
                      {getIconForTag(t.name)}
                    </span>
                    {t.name}
                    <span className="tag-bubble">{t.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
