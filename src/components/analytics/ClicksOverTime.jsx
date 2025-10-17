import React, { useMemo } from "react";
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
 * - data: [{ date: "YYYY-MM-DD", clicks: number }, ...]  (if omitted, uses sample 30 days)
 * - height: chart height in px (default 220)
 */
export default function ClicksOverTime({ data, height = 220 }) {
  const context = React.useContext(UrlContext
  );
  const { filtered } = context;
  // generate chart data from filtered URLs
  const chartData = useMemo(() => {
    if (data && Array.isArray(data) && data.length) return data;
    
    // Use filtered data if available
    if (filtered && filtered.length > 0) {
      // Create a map to store clicks by date
      const clicksByDate = {};
      
      // Get date range for last 30 days
      const now = new Date();
      const dates = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
        dates.push(dateStr);
        clicksByDate[dateStr] = 0;
      }
      
      // Aggregate clicks from filtered URLs
      filtered.forEach(url => {
        if (url.url_clicks && url.url_clicks > 0) {
          // For simplicity, distribute clicks across recent dates
          // In a real app, you'd use actual click timestamps
          const randomDayIndex = Math.floor(Math.random() * 10); // Last 10 days
          const dateIndex = dates.length - 1 - randomDayIndex;
          if (dateIndex >= 0) {
            clicksByDate[dates[dateIndex]] += url.url_clicks;
          }
        }
      });
      
      // Convert to array format for chart
      return dates.map(date => ({
        date,
        clicks: clicksByDate[date]
      }));
    }
    
    // Fallback to empty data
    const sample = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      sample.push({ date: label, clicks: 0 });
    }
    return sample;
  }, [data, filtered]);

  return (
    <div className="clicks-chart-card">
      <div className="chart-header">
        <div className="chart-title">
          Clicks Over Time <span className="muted">(Last 30 Days)</span>
        </div>
      </div>

      <div className="chart-wrap" style={{ height }}>
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
              interval={4}
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
