import React from "react";
import "../CSS/StatsCard.css";
// Optional icons (install lucide-react if you want icons)
import { Link2, MousePointerClick, Bell } from "lucide-react";

/**
 * StatsCard props:
 *  - urls: number
 *  - clicks: number
 *  - reminders: number
 *  - subLabels: optional object to override small labels
 *
 * Example usage:
 * <StatsCard urls={120} clicks={5234} reminders={8} />
 */
export default function StatsCard({
  urls = 5,
  clicks = 0,
  reminders = 0,
  subLabels = {},
  inputFocus,
}) {
  const labels = {
    urls: subLabels.urls || "URLs",
    clicks: subLabels.clicks || "Clicks",
    reminders: subLabels.reminders || "Reminders",
  };

  const formatNumber = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)
      return `${(n / 1_000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })}k`;
    return n.toString();
  };

  return (
    <section className={`stats-card ${inputFocus ? "focus" : ""}`} aria-label="Statistics">
      <div className="stats-card-inner">
        <header className="stats-header">
          <span className="stats-title">STATS</span>
        </header>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">
              <Link2 />
            </div>
            <div className="stat-value">{formatNumber(urls)}</div>
            <div className="stat-label">{labels.urls}</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <MousePointerClick />
            </div>
            <div className="stat-value highlight">{formatNumber(clicks)}</div>
            <div className="stat-label">{labels.clicks}</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <Bell />
            </div>
            <div className="stat-value">{formatNumber(reminders)}</div>
            <div className="stat-label">{labels.reminders}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
