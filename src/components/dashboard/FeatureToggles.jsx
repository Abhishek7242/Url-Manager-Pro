import React, { useState, useEffect } from "react";
import "../CSS/FeatureToggles.css";

export default function FeatureToggles({
  onToggle = () => {},
  setStatsView = () => {},
  setTagsView = () => {},
  setUrlsView = () => {},
}) {
  const defaultRows = [
    { id: "stats", label: "Lynkr Stats", enabled: true },
    { id: "tags", label: "Lynkr Tags", enabled: true },
    { id: "urls", label: "Lynkr urls", enabled: true },
  ];

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem("lynkr_toggles");
    if (!saved) return defaultRows;

    try {
      const parsed = JSON.parse(saved);
      const byId = parsed.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {});
      return defaultRows.map((d) =>
        byId[d.id] ? { ...d, enabled: !!byId[d.id].enabled } : d
      );
    } catch (e) {
      return defaultRows;
    }
  });

  // Apply visibility to parent AFTER render — whenever rows change.
  useEffect(() => {
    rows.forEach((row) => {
      if (row.id === "stats") setStatsView(row.enabled ? "visible" : "");
      if (row.id === "tags") setTagsView(row.enabled ? "visible" : "");
      if (row.id === "urls") setUrlsView(row.enabled ? "visible" : "");
    });
    // include setters to satisfy exhaustive-deps and avoid stale closures
  }, [rows, setStatsView, setTagsView, setUrlsView]);

  // Save every time rows change
  useEffect(() => {
    localStorage.setItem("lynkr_toggles", JSON.stringify(rows));
  }, [rows]);

  function toggleRow(id) {
    setRows((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );

      // Notify parent AFTER updating rows (we still call here because it's inside an event handler)
      const changed = next.find((r) => r.id === id);
      const isEnabled = !!changed?.enabled;
      onToggle(id, isEnabled);

      // we don't call setStatsView/setTagsView/setUrlsView here to avoid risk of cross-component updates during render;
      // the effect above (dependent on rows) will sync parent view after setRows completes.
      // persist is handled in useEffect, but writing immediately here is optional:
      localStorage.setItem("lynkr_toggles", JSON.stringify(next));

      return next;
    });
  }

  return (
    <div className="ft-card">
      {rows.map((row, idx) => (
        <div key={row.id}>
          <div className="ft-row" role="group" aria-label={row.label}>
            <div className="ft-label">{row.label}</div>

            <button
              className={`ft-switch ${row.enabled ? "on" : "off"}`}
              role="switch"
              aria-checked={row.enabled}
              onClick={() => toggleRow(row.id)}
            >
              <span className="ft-knob" />
            </button>
          </div>

          {idx < rows.length - 1 && <div className="ft-divider" />}
        </div>
      ))}
    </div>
  );
}
