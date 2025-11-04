import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";
import "../CSS/BackgroundSettings.css";

const BACKGROUNDS = {
  live: [
    {
      name: "Matrix Stream",
      url: "https://wallpapercave.com/wp/wp2760959.gif",
    },
    {
      name: "Aurora Flow",
      url: "https://wallpapercave.com/wp/wp2757834.gif",
    },
    {
      name: "Cyber Tunnel",
      url: "https://www.pixelstalk.net/wp-content/uploads/2016/06/Animated-Gif-Images-Download.gif",
    },
    {
      name: "Amoled Flow",
      url: "https://cdn.wallpapersafari.com/95/37/LQSUZV.gif",
    },
    {
      name: "Glowing Lines",
      url: "https://cdn.dribbble.com/userupload/19624959/file/original-4542e8a8f3bd8017a0882363a1107498.gif",
    },
    {
      name: "Cyber Wave",
      url: "https://wallpapercave.com/wp/wp3234203.gif",
    },
  ],

  image: [
    {
      name: "Aurora",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    },
    {
      name: "Sunset",
      url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80",
    },
    {
      name: "Nature",
      url: "https://wallpapers.com/images/hd/serene-glacial-lake-vj6jbi9cqsoa6bg1.jpg",
    },
    {
      name: "Minimal Light",
      url: "https://4kwallpapers.com/images/wallpapers/3d-background-4480x2520-9771.jpg",
    },
    {
      name: "Dark Horizon",
      url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80",
    },
    {
      name: "City Lights",
      url: "https://images.unsplash.com/photo-1497290756760-23ac55edf36f?auto=format&fit=crop&w=1400&q=80",
    },
  ],

  gradient: [
    {
      name: "Electric Purple",
      url: "linear-gradient(135deg, #3a0ca3, #7209b7, #f72585)",
    },
    {
      name: "Blue Circuit",
      url: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    },
    {
      name: "Sunset Blaze",
      url: "linear-gradient(135deg, #ff512f, #dd2476)",
    },
    {
      name: "Mint Fusion",
      url: "linear-gradient(135deg, #00c9ff, #92fe9d)",
    },
    {
      name: "Royal Dream",
      url: "linear-gradient(135deg, #1e3c72, #2a5298)",
    },
    {
      name: "Cyber Pink",
      url: "linear-gradient(135deg, #ff758c, #ff7eb3)",
    },
  ],

  solid: [
    { name: "Pure Black", url: "#000000" },
    { name: "Soft Gray", url: "#1e1e1e" },
    { name: "Sky Blue", url: "#4da6ff" },
    { name: "Mint Green", url: "#3fc380" },
    { name: "Crimson Red", url: "#e63946" },
    { name: "Royal Purple", url: "#5f0f40" },
  ],
};


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
  const { updateRootBackground } = React.useContext(UrlContext);
  const [openPanel, setOpenPanel] = useState(null); // 'solid'|'gradient'|'image'|'live'
  const [selected, setSelected] = useState(
    localStorage.getItem("appBackground") || BACKGROUNDS.gradient[1].url
  );
  const [refreshOnNewTab, setRefreshOnNewTab] = useState(false);

  useEffect(() => {
    // restore background on mount
    updateRootBackground(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const items = openPanel ? BACKGROUNDS[openPanel] || [] : [];

  return (
    <div className="background-settings-root">
      {/* show top tiles only when no group is open */}
      {!openPanel && (
        <div className="panel-grid">
          <PanelTile
            title="Solid colors"
            subtitle="Simple & clean"
            previewStyle={{ background: BACKGROUNDS.solid[0].url }}
            onOpen={() => open("solid")}
          />
          <PanelTile
            title="Gradients"
            subtitle="Smooth blends"
            previewStyle={{ background: BACKGROUNDS.gradient[0].url }}
            onOpen={() => open("gradient")}
          />
          <PanelTile
            title="Image Backgrounds"
            subtitle="Photos & scenery"
            previewStyle={{
              background: `url(${BACKGROUNDS.image[0].url}) center/cover`,
            }}
            onOpen={() => open("image")}
          />
          <PanelTile
            title="Live Wallpapers"
            subtitle="Animated GIFs"
            previewStyle={{
              background: `url(${BACKGROUNDS.live[0].url}) center/cover`,
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

            {/* <div className="group-controls">
              <div
                className={`toggle-wrapper ${refreshOnNewTab ? "active" : ""}`}
                onClick={() => setRefreshOnNewTab((prev) => !prev)}
              >
                <div className="toggle-slider" />
              </div>
              <span className="toggle-label">
                {refreshOnNewTab ? "Auto change is ON" : "Auto change is OFF"}
              </span>
            </div> */}
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
