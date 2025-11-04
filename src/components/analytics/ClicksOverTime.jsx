// src/components/ClicksOverTime/ClicksOverTime.jsx
import React, { useMemo, useState, useEffect, useContext } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "../CSS/ClicksOverTime.css";
import UrlContext from "../../context/url_manager/UrlContext";

/**
 * Props:
 * - data: [{ date: "M/D" or "YYYY-MM-DD", clicks: number }, ...]  (if omitted, uses generated last 30 days)
 * - height: preferred chart height (default 220)
 *
 * Notes:
 * - The component computes an adaptive height for small screens (mobile/tablet),
 *   and listens to window resize to update height dynamically.
 * - If you do server-side rendering, the initial width fallback prevents SSR errors.
 */
export default function ClicksOverTime({ data, height = 220 }) {
  const { filtered } = useContext(UrlContext);

  // responsiveHeight: adapts based on current window width
  const getHeightForWidth = (w, base = height) => {
    if (w <= 320) return Math.max(140, Math.floor(base * 0.68)); // ultra small
    if (w <= 400) return Math.max(150, Math.floor(base * 0.73));
    if (w <= 600) return Math.max(160, Math.floor(base * 0.82));
    if (w <= 900) return Math.max(180, Math.floor(base * 0.9));
    return base;
  };

  const initialWidth =
    typeof window !== "undefined" && window.innerWidth
      ? window.innerWidth
      : 1024;
  const [responsiveHeight, setResponsiveHeight] = useState(
    getHeightForWidth(initialWidth)
  );

  useEffect(() => {
    // update on mount (handles cases where initialWidth fallback used)
    setResponsiveHeight(getHeightForWidth(window.innerWidth));

    const onResize = () => {
      setResponsiveHeight(getHeightForWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [height]);

  // build chart data (last 30 days) using supplied data or from filtered URLs
  const chartData = useMemo(() => {
    // if explicit data passed, use it (but normalize dates to simple labels)
    if (Array.isArray(data) && data.length) {
      // if dates are YYYY-MM-DD convert to M/D for compact x-axis
      return data.map((d) => {
        if (!d) return { date: "", clicks: 0 };
        const clicks =
          typeof d.clicks === "number" ? d.clicks : Number(d.clicks) || 0;
        const raw = d.date || "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          const parts = raw.split("-");
          const month = Number(parts[1]);
          const day = Number(parts[2]);
          return { date: `${month}/${day}`, clicks };
        }
        return { date: raw, clicks };
      });
    }

    // helper: generate last N day labels (M/D)
    const now = new Date();
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }

    // if filtered URLs present, aggregate clicks across recent days
    if (Array.isArray(filtered) && filtered.length > 0) {
      const clicksByDate = {};
      dates.forEach((dt) => (clicksByDate[dt] = 0));

      // Aggregate using url.url_clicks. If URL contains click timestamps in a
      // `click_history` array (optional), use that — otherwise distribute to last 10 days.
      filtered.forEach((url) => {
        const clicks = Number(url.url_clicks) || 0;
        if (clicks <= 0) return;

        // use precise click_history if available (array of ISO timestamps)
        if (Array.isArray(url.click_history) && url.click_history.length > 0) {
          url.click_history.forEach((ts) => {
            const t = new Date(ts);
            if (isNaN(t)) return;
            const label = `${t.getMonth() + 1}/${t.getDate()}`;
            if (label in clicksByDate) clicksByDate[label] += 1;
          });
          return;
        }

        // fallback: distribute total clicks pseudo-randomly across last 10 days
        const daysWindow = Math.min(10, dates.length);
        let remaining = clicks;
        // give larger share to more recent days
        for (let i = 0; i < daysWindow && remaining > 0; i++) {
          // weight: more recent days get higher portion
          const weight =
            (daysWindow - i) / ((daysWindow * (daysWindow + 1)) / 2);
          const assign = Math.round(
            clicks * weight * (0.4 + Math.random() * 0.8)
          );
          const idx = dates.length - 1 - i;
          const take = Math.min(remaining, assign);
          clicksByDate[dates[idx]] += take;
          remaining -= take;
        }
        // if anything left (rare), push to most recent day
        if (remaining > 0) clicksByDate[dates[dates.length - 1]] += remaining;
      });

      return dates.map((d) => ({ date: d, clicks: clicksByDate[d] || 0 }));
    }

    // final fallback: return zero-filled last 30 days
    return dates.map((d) => ({ date: d, clicks: 0 }));
  }, [data, filtered]);

  return (
    <div
      className="clicks-chart-card"
      role="region"
      aria-label="Clicks Over Time chart"
    >
      <div className="chart-header">
        <div className="chart-title">
          Clicks Over Time <span className="muted">(Last 30 Days)</span>
        </div>
      </div>

      <div className="chart-wrap" style={{ height: responsiveHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 6 }}
          >
            <defs>
              <linearGradient id="gradClicks" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(158,139,255,0.95)" />
                <stop offset="60%" stopColor="rgba(158,139,255,0.35)" />
                <stop offset="100%" stopColor="rgba(158,139,255,0.06)" />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 6"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.04)" }}
              tickLine={false}
              interval={Math.max(0, Math.floor(chartData.length / 6))} // dynamic tick density
              minTickGap={8}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip
              contentStyle={{
                background: "#0f1726",
                border: "1px solid rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 13,
                borderRadius: 8,
                padding: "8px 10px",
              }}
              itemStyle={{ color: "#9fb9ff" }}
              labelStyle={{ color: "#9aa6b1", fontSize: 12 }}
            />

            <Area
              type="monotone"
              dataKey="clicks"
              stroke="rgba(168,125,255,0.95)"
              strokeWidth={2.2}
              fill="url(#gradClicks)"
              activeDot={{
                r: 4,
                fill: "#9e8bff",
                stroke: "rgba(255,255,255,0.06)",
              }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
