import React, { useState, useEffect, useContext } from "react";
import { FiArrowLeft } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";
import "../CSS/BackgroundSettings.css";

function PanelTile({ title, subtitle, previewStyle, onOpen }) {
  return (
    <button
      className="bg-tile"
      onClick={onOpen}
      type="button"
      style={previewStyle}
    >
      <div className="bg-tile-footer">
        <div className="bg-tile-title">{title}</div>
        <div className="bg-tile-sub">{subtitle}</div>
      </div>
    </button>
  );
}

function ThumbsGrid({ items = [], selected, onSelect }) {
  if (!items || items.length === 0)
    return <div className="empty">No backgrounds</div>;
  return (
    <div className="thumbs-grid" role="list">
      {items.map((bg) => {
        const isImage =
          typeof bg.url === "string" &&
          (bg.url.endsWith(".gif") ||
            bg.url.startsWith("http") ||
            bg.url.startsWith("/"));
        const style = isImage
          ? { background: `url(${bg.url}) center/cover no-repeat` }
          : { background: bg.url };
        return (
          <button
            key={bg.name}
            className={`thumb ${selected === bg.url ? "active" : ""}`}
            onClick={() => onSelect(bg.url)}
            title={bg.name}
            aria-pressed={selected === bg.url}
            type="button"
            style={style}
          >
            <div className="thumb-overlay">
              <div className="thumb-name">{bg.name}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function BackgroundSettingsFull() {
  const { updateRootBackground, fetchBackgrounds } = useContext(UrlContext);

  // safe default so we can reference gradient[0] etc without crash
  const defaultBackgrounds = {
    solid: [],
    gradient: [],
    image: [],
    live: [],
  };

  const [openPanel, setOpenPanel] = useState(null); // 'solid'|'gradient'|'image'|'live'
  const [backgrounds, setBackgrounds] = useState(defaultBackgrounds);

  // initialize selected from localStorage if present; otherwise empty string for now
  const [selected, setSelected] = useState(
    () => localStorage.getItem("appBackground") || ""
  );
  const [refreshOnNewTab, setRefreshOnNewTab] = useState(false);

  // Fetch backgrounds once
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchBackgrounds();
        if (!mounted) return;
        // ensure the returned data has the expected shape
        setBackgrounds({
          solid: Array.isArray(data.solid) ? data.solid : [],
          gradient: Array.isArray(data.gradient) ? data.gradient : [],
          image: Array.isArray(data.image) ? data.image : [],
          live: Array.isArray(data.live) ? data.live : [],
        });
      } catch (err) {
        console.error("Failed to fetch backgrounds:", err);
        // keep defaults (empty arrays)
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [fetchBackgrounds]);

  // When backgrounds load, pick a sensible default if none saved
  useEffect(() => {
    if (selected) {
      // if user already had a selection, ensure it's applied
      updateRootBackground(selected);
      return;
    }

    // choose default: gradient[1] -> gradient[0] -> image[0] -> live[0] -> first available -> ''
    const candidate =
      backgrounds.gradient?.[0]?.url ||
      backgrounds.gradient?.[0]?.url ||
      backgrounds.image?.[0]?.url ||
      backgrounds.live?.[0]?.url ||
      backgrounds.solid?.[0]?.url ||
      "";

    if (candidate) {
      setSelected(candidate);
      localStorage.setItem("appBackground", candidate);
      updateRootBackground(candidate);
    } else {
      // nothing to apply yet
      updateRootBackground(""); // or skip if you prefer
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgrounds]); // run when backgrounds change

  function open(panel) {
    setOpenPanel(panel);
  }

  function close() {
    setOpenPanel(null);
  }

  // Immediately apply background when a thumb is clicked
  function apply(bg) {
    setSelected(bg);
    localStorage.setItem("appBackground", bg);
    updateRootBackground(bg);
  }

  const items = openPanel ? backgrounds[openPanel] || [] : [];

  // safe previewStyle usage with optional chaining and fallback
  const previewSolid = backgrounds.solid?.[0]?.url || "transparent";
  const previewGradient =
    backgrounds.gradient?.[0]?.url || "linear-gradient(#333, #666)";
  const previewImage = backgrounds.image?.[0]?.url || "";
  const previewLive = backgrounds.live?.[0]?.url || "";

  return (
    <div className="background-settings-root">
      {/* show top tiles only when no group is open */}
      {!openPanel && (
        <div className="panel-grid">
          <PanelTile
            title="Solid colors"
            subtitle="Simple & clean"
            previewStyle={{ background: previewSolid }}
            onOpen={() => open("solid")}
          />
          <PanelTile
            title="Gradients"
            subtitle="Smooth blends"
            previewStyle={{ background: previewGradient }}
            onOpen={() => open("gradient")}
          />
          <PanelTile
            title="Image Backgrounds"
            subtitle="Photos & scenery"
            previewStyle={{
              background: previewImage
                ? `url(${previewImage}) center/cover`
                : "var(--card)",
            }}
            onOpen={() => open("image")}
          />
          <PanelTile
            title="Live Wallpapers"
            subtitle="Animated GIFs"
            previewStyle={{
              background: previewLive
                ? `url(${previewLive}) center/cover`
                : "var(--card)",
            }}
            onOpen={() => open("live")}
          />
        </div>
      )}

      {/* when a group is open show large full area with only wallpapers */}
      {openPanel && (
        <div className="group-view">
          <div className="group-header">
            <div className="flex">
              <button className="back-btn" onClick={close} aria-label="Back">
                <FiArrowLeft />
              </button>
              <h2 className="group-title">
                {openPanel === "solid" && "Solid colors"}
                {openPanel === "gradient" && "Gradients"}
                {openPanel === "image" && "Image Backgrounds"}
                {openPanel === "live" && "Live Wallpapers"}
              </h2>
            </div>
          </div>

          <div className="group-body">
            {/* thumbnails only (full area) */}
            <div className="group-thumbs">
              {/* onSelect applies immediately */}
              <ThumbsGrid
                items={items}
                selected={selected}
                onSelect={(bg) => apply(bg)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
