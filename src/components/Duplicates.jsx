import React, { useEffect, useState, useContext } from "react";
import {
  FiAlertTriangle,
  FiExternalLink,
  FiClock,
  FiLoader,
  
} from "react-icons/fi";
import "./CSS/Duplicates.css";
import UrlContext from "../context/url_manager/UrlContext";
import NeonOrbitalLoader from "./NeonOrbitalLoader";
import NoDuplicates from "./duplicates/NoDuplicates";

export default function Duplicates() {
  const {
    getAllUrls,
    setUrls,
    filtered,
    onKeep,
    showNotify,
    updateClickCount,
    setScreenLoading,
  } = useContext(UrlContext);

  const [loading, setLoading] = useState(true);
  const [keepingId, setKeepingId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUrls = async () => {
      try {
        setLoading(true);
        const res = await getAllUrls();
        // only update when still mounted and we received data
        if (mounted && res && res.data) {
          setUrls(res.data);
        }
      } catch (err) {
        // console.error("❌ Error fetching URLs:", err);
      } finally {
        if (mounted) setLoading(false);
        setScreenLoading(false)
      }
    };

    fetchUrls();

    return () => {
      mounted = false;
    };
  }, []);

  // build duplicate groups from urls so each group has .items[].
  const groupsFromUrls = Array.isArray(filtered)
    ? Object.values(
        filtered.reduce((acc, u) => {
          const key = u.url || "";
          if (!acc[key]) acc[key] = { key, count: 0, items: [] };
          acc[key].items.push(u);
          acc[key].count = acc[key].items.length;
          return acc;
        }, {})
      )
    : [];

  // only keep groups that actually have duplicates (count > 1)
  const data = groupsFromUrls.filter((g) => g.count > 1);
// console.log( data);
  const handleKeep = async (id) => {
    setKeepingId(id);
    try {
      let res = await onKeep(id);
      if (res) {
        showNotify("success", res.deleted_count + " " + res.message);
        setLoading(true);
        // Reload page data after successful removal
        const freshData = await getAllUrls();
        if (freshData && freshData.data) {
          setUrls(freshData.data);
        setLoading(false);

        }
      } else {
        showNotify("error", res.message);
      }
    } catch (error) {
      // console.error("Error in handleKeep:", error);
      showNotify("error", "Failed to remove duplicates");
    } finally {
      setKeepingId(null);
    }
  };

  // LOADING VIEW: uses FiLoader + .loading-icon (your CSS spin rule targets .loading-icon svg)
  if (loading) {
    return (
      <div className="relative h-full pt-32 w-full flex items-center justify-center">
        <NeonOrbitalLoader />
      </div>
    );
  }

  // NO DUPLICATES VIEW
  if (!data || data.length === 0) {
    return (
    <NoDuplicates/>
    );
  }

  // MAIN DUPLICATES VIEW
  return (
    <div className="dups-root">
      <div className="dups-header">
        <div className="dups-title">
          <FiAlertTriangle className="warning-icon" />
          <div>
            <h3>Duplicate URLs Detected</h3>
            <p className="sub">
              Found {data.length} group{data.length > 1 ? "s" : ""} with
              duplicate URLs
            </p>
          </div>
        </div>
      </div>

      <div className="dups-list">
        {data.map((g) => (
          <div className="dup-group" key={g.key}>
            <div className="group-top">
              {data.length > 0 && (
                <p className="group-key">
                  {g.key}
                  <span className="badge">{g.count} duplicates</span>
                </p>
              )}
            </div>

            <div className="group-items">
              {Array.isArray(g.items)
                ? g.items.map((it) => (
                    <div className="dup-item" key={it.id}>
                      <div className="item-left">
                        <input
                          type="checkbox"
                          aria-label={`select ${it.title}`}
                        />

                        <div className="item-content">
                          <div className="item-title-row">
                            <div className="item-title">{it.title}</div>
                            {it.isLatest && (
                              <span className="pill latest">Latest</span>
                            )}
                          </div>

                          <a
                            onClick={() => updateClickCount(it.id)}
                            className="item-url"
                            href={it.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FiExternalLink className="link-icon" /> {it.url}
                          </a>

                          <div className="item-meta">
                            <span className="meta-created flex gap-2 items-center">
                              <FiClock className="meta-icon" /> {it.formatted_created_at}
                            </span>
                            {it.tags && it.tags.length > 0 && (
                              <span className="meta-tags">
                                Tags: {it.tags.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="item-actions">
                        <button
                          className="btn keep"
                          onClick={() => handleKeep(it.id)}
                          disabled={keepingId !== null}
                          title="Keep this (preserve)"
                        >
                          {keepingId === it.id ? (
                            <>
                              <FiLoader className="spin-icon" /> Keeping...
                            </>
                          ) : (
                            "Keep This"
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
