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
    // load saved toggles if available
    const saved = localStorage.getItem("lynkr_toggles");
    if (!saved) return defaultRows;

    try {
      const parsed = JSON.parse(saved);
      // Merge saved with defaults to ensure any missing entries (like "urls") are added
      const byId = parsed.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {});
      return defaultRows.map((d) =>
        byId[d.id] ? { ...d, enabled: !!byId[d.id].enabled } : d
      );
    } catch (e) {
      // if parse fails, fall back to defaults
      return defaultRows;
    }
  });

  // Apply visibility to parent views on mount (for all rows)
  useEffect(() => {
    rows.forEach((row) => {
      if (row.id === "stats") setStatsView(row.enabled ? "visible" : "");
      if (row.id === "tags") setTagsView(row.enabled ? "visible" : "");
      if (row.id === "urls") setUrlsView(row.enabled ? "visible" : "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Save every time rows change
  useEffect(() => {
    localStorage.setItem("lynkr_toggles", JSON.stringify(rows));
  }, [rows]);

  function toggleRow(id) {
    setRows((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );

      const changed = next.find((r) => r.id === id);
      const isEnabled = changed.enabled;

      // Control visibility
      if (id === "stats") setStatsView(isEnabled ? "visible" : "");
      if (id === "tags") setTagsView(isEnabled ? "visible" : "");
      if (id === "urls") setUrlsView(isEnabled ? "visible" : "");

      // Notify parent if needed
      onToggle(id, isEnabled);

      // Save immediately
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
