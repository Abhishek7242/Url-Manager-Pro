import React, { useRef, useEffect, useState } from "react";
import {
  FiExternalLink,
  FiTrash2,
  FiCopy,
  FiMoreVertical,
  FiEdit2,
  FiCheck,
  FiStar,
  FiInfo,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa"; // filled star
import "../CSS/LinkCard.css";
import UrlContext from "../../context/url_manager/UrlContext";
import MoreMenu from "./MoreMenu"; // new component (same folder)

export default function LinkCard({
  link,
  selected,
  activeMode,
  onSelect = () => {},
  onDelete = () => {},
  onShare = () => {},
}) {
  const context = React.useContext(UrlContext);
  const {
    deleteUrlPost,
    setUrls,
    urls,
    showNotify,
    updateClickCount,
    setFormData,
    setIsEditOpen,
    getXsrfHeader,
    API_BASE,
    filtered,
    isLoggedIn,
    setShowAuthFeature,
    setShowDetails,
    setShowDetailsView,
  } = context || {};

  const [copied, setCopied] = useState(false);
  const menuAnchorRef = useRef(null); // used for both grid and list
  const moreBtnRef = menuAnchorRef; // alias for clarity
  const [menuOpen, setMenuOpen] = useState(false);

  // Copy URL
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      if (showNotify) showNotify("success", "URL copied to clipboard!");
      setTimeout(() => setCopied(false), 1800);
      setMenuOpen(false);
    } catch (err) {
      if (showNotify) showNotify("error", "Failed to copy URL!");
    }
  };

  // Delete URL
  const handleDelete = (id) => {
    if (deleteUrlPost) deleteUrlPost(id);
    if (setUrls) setUrls((prev) => prev.filter((x) => x.id !== id));
    if (onDelete) onDelete(id);
    if (showNotify) showNotify("success", "URL deleted successfully!");
    setMenuOpen(false);
  };

  const handleToggleFavourite = async (id) => {
  console.log( id);
  if (!id) return;

  try {
    // 🔹 1. Find current link
    const isCurrentlyFav = Array.isArray(id?.tags)
      ? id.tags.includes("#favourite")
      : false;
console.log(isCurrentlyFav);
    // 🔹 2. Optimistic UI update
 

    // 🔹 3. Send API request to backend
    const response = await fetch(`${API_BASE}/update-favourite`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getXsrfHeader(),
      },
      credentials: "include",
      body: JSON.stringify({
        id: id.id,
        favourite: !isCurrentlyFav, // backend can handle tag add/remove
      }),
    });

    if (!response.ok) throw new Error("Failed to update favourite");

    const data = await response.json();
   if (setUrls) {
     setUrls((prev) =>
       prev.map((x) =>
         x.id === id.id
           ? {
               ...x,
               tags: isCurrentlyFav
                 ? x.tags.filter((t) => t !== "#favourite")
                 : [...(x.tags || []), "#favourite"],
             }
           : x
       )
     );
   }
    // 🔹 4. Notify success
    if (showNotify) {
      showNotify(
        "success",
        data?.message ||
          (!isCurrentlyFav ? "Marked as favourite" : "Removed from favourites")
      );
    }
  } catch (err) {
    console.error("Favourite update failed:", err);
    if (showNotify) showNotify("error", "Failed to update favourite");
  } finally {
    setMenuOpen(false);
  }
};

  // Details (simple notify / fallback to alert)
  const handleDetails = (linkObj) => {
    setMenuOpen(false);
    setShowDetailsView(true)
    setShowDetails(linkObj);
  };

  const onEdit = (linkObj) => {
    if (setFormData) {
      setFormData({
        id: linkObj.id,
        title: linkObj.title,
        url: linkObj.url,
        note: linkObj.note || "",
        tags: (linkObj.tags || []).join(", "),
        reminder_at: linkObj.reminder_at || "",
      });
    }
    if (setIsEditOpen) setIsEditOpen(true);
    setMenuOpen(false);
  };

  // Keyboard toggle for menu (Enter/Space)
  function handleMoreKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMenuOpen((v) => !v);
    }
  }

  // Close menu on outside click (kept for compatibility but MoreMenu also handles outside clicks)
useEffect(() => {
  function handleOutside(e) {
    if (!menuOpen) return;

    const clickedInsideAnchor =
      menuAnchorRef.current && menuAnchorRef.current.contains(e.target);

    // check if click is inside the floating portal menu
    const floatingMenu = document.querySelector(
      ".more-menu.more-menu--floating"
    );
    const clickedInsideMenu = floatingMenu && floatingMenu.contains(e.target);

    if (!clickedInsideAnchor && !clickedInsideMenu) {
      setMenuOpen(false);
    }
  }
  document.addEventListener("mousedown", handleOutside);
  return () => document.removeEventListener("mousedown", handleOutside);
}, [menuOpen]);

  // truncate helper
  const truncate = (text = "", max = 12) =>
    text && text.length > max ? text.slice(0, max) + "..." : text;

  // Favicon
  let faviconUrl = "";
  try {
    faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${
      new URL(link.url).hostname
    }`;
  } catch (err) {
    faviconUrl = "";
  }

  // Build menu items once (reusable)
  const menuItems = [
    {
      key: "edit",
      label: "Edit",
      icon: FiEdit2,
      onClick: () => onEdit(link),
    },
    {
      key: "copy",
      label: "Copy",
      icon: FiCopy,
      onClick: handleCopy,
    },
 {
  key: "favourite",
  label: (link.tags || []).includes("#favourite")
    ? "Unfavourite"
    : "Favourite",
  icon: (link.tags || []).includes("#favourite") ? FaStar : FiStar,
  className: (link.tags || []).includes("#favourite") ? "fav-active" : "",
  onClick: () => {
    if (isLoggedIn) {
      handleToggleFavourite(link);
    } else {
      setShowAuthFeature(true); // Show login-required modal
    }
  },
},

    {
      key: "details",
      label: "Details",
      icon: FiInfo,
      onClick: () => handleDetails(link),
    },
    {
      key: "delete",
      label: "Delete",
      icon: FiTrash2,
      className: "danger",
      onClick: () => handleDelete(link.id),
    },
  ];

  // GRID MODE: compact clickable tile (favicon + title) + three-dot menu
  if (activeMode === "grid") {
    return (
      <div
        className={`link-card grid-mode ${selected ? "selected" : ""}`}
        style={{ zIndex: menuOpen ? 999 : 1 }}
      >
        <a
          className={`grid-tile-link ${selected ? "selected" : ""}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            if (updateClickCount) updateClickCount(link.id);
          }}
          aria-label={link.title || link.url}
        >
          <div className="tile-icon" aria-hidden="true">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" />
            ) : (
              <div style={{ width: 36, height: 36 }} />
            )}
          </div>

          <div className="tile-title" title={link.title}>
            {truncate(link.title || link.url, 14)}
          </div>
        </a>

        {/* anchor for MoreMenu */}
        <div className="more-wrapper grid-more">
          <button
            ref={menuAnchorRef}
            className="icon-btn more-btn"
            title="More options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            onKeyDown={handleMoreKey}
          >
            <FiMoreVertical />
          </button>

          {menuOpen && (
            <MoreMenu
              anchorRef={menuAnchorRef}
              items={menuItems}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // DEFAULT (list) mode — original card layout with MoreMenu
  return (
    <div
      key={link.id}
      className={`link-card ${activeMode} ${selected ? "selected" : ""}`}
      style={{ zIndex: menuOpen ? 999 : 1 }}
    >
      <div className="card-top">
        <div className="favicon-wrapper">
          <img src={faviconUrl} alt="favicon" className="favicon" />
        </div>

        <div className="card-info">
          <h3 className="card-title">{link.title}</h3>
          <a
            href={link.url}
            onClick={ () => {
              if (updateClickCount) updateClickCount(link.id);
            }}
            target="_blank"
            rel="noreferrer"
            className="card-url"
          >
            <span title={link.url}>{link.url}</span>
          </a>
          <div className="card-tags">
            {Array.isArray(link.tags)
              ? link.tags.map((tag, idx) => (
                  <span key={idx} className="tag-item">
                    {tag.trim()}
                  </span>
                ))
              : typeof link.tags === "string"
              ? link.tags
                  .split(",")
                  .map((t, idx) => t.trim())
                  .filter(Boolean)
                  .map((tag, idx) => (
                    <span key={idx} className="tag-item">
                      {tag}
                    </span>
                  ))
              : null}
          </div>
        </div>

        <div className="action-group">
          <button
            className="pill-btn copy"
            onClick={handleCopy}
            aria-label="Copy"
          >
            {copied ? (
              <FiCheck className="pill-icon success-icon" />
            ) : (
              <FiCopy className="pill-icon" />
            )}
          </button>

          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="pill-btn open open-link"
            onClick={() => updateClickCount && updateClickCount(link.id)}
          >
            <FiExternalLink className="pill-icon" />
            <span> Open</span>
          </a>

          <div className="more-wrapper">
            <button
              ref={menuAnchorRef}
              className="icon-btn more-btn"
              title="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              onKeyDown={handleMoreKey}
            >
              <FiMoreVertical />
            </button>

            {menuOpen && (
              <MoreMenu
                anchorRef={menuAnchorRef}
                items={menuItems}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
