import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import "../CSS/TopTags.css";
import UrlContext from "../../context/url_manager/UrlContext";

/**
 * Props:
 * - data: [{ name: 'imp', value: 2 }, { name: 'test1', value: 4 }, ...]
 * - height: number (px) default 240
 */
export default function TopTags() {
  // sample fallback
  const context = React.useContext(UrlContext);
  const {filtered,
  } = context;
  const chartData = useMemo(() => {
    
    // Use filtered data from context to generate tag statistics
    if (filtered && filtered.length > 0) {
      // Count occurrences of each tag
      const tagCounts = {};
      filtered.forEach(url => {
        if (url.tags && Array.isArray(url.tags)) {
          url.tags.forEach(tag => {
            if (tag) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        }
      });
      
      // Convert to array format needed for chart
      const tagData = Object.entries(tagCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Show top 5 tags
      
      if (tagData.length > 0) {
        return tagData;
      }
    }
    
    // Fallback sample data
    return [
   
    ];
  }, [ filtered]);

  // colors: use a variety of colors for different tags
  const colorPalette = [
    "#3b82f6", // blue
    "#06b6a4", // teal
    "#f59e0b", // amber
    "#ec4899", // pink
    "#8b5cf6", // violet
    "#ef4444", // red
    "#10b981", // emerald
    "#f97316", // orange
    "#6366f1", // indigo
    "#84cc16"  // lime
  ];

  // format legend items to show percent
  const total = chartData.reduce((s, d) => s + d.value, 0);
  // const renderLegend = (value, entry) => {
  //   const item = chartData.find((d) => d.name === value);
  //   const pct = total ? Math.round((item.value / total) * 100) : 0;
  //   return (
  //     <span className="legend-item">
  //       {value} ({pct}%)
  //     </span>
  //   );
  // };

  return (
    <div className="top-tags-card" style={{ height: 350 }}>
      <div className="top-tags-header">
        <div className="left">
          <div className="tag-title">Top Tags</div>
        </div>
      </div>

      <div className="top-tags-body">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={4}
                startAngle={90}
                endAngle={-270}
                stroke="rgba(255,255,255,0.06)"
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`c-${idx}`} fill={colorPalette[idx % colorPalette.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#0f1726",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#ffffff" }}
                formatter={(value, name) => {
                  const pct = total ? Math.round((value / total) * 100) : 0;
                  return [`${value} (${pct}%)`, name];
                }}
              />

              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ right: 6, top: 12 }}
                formatter={(value) => {
                  const item = chartData.find((d) => d.name === value);
                  if (!item) return value;
                  const pct = total ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div className="legend-row">
                      <span className="legend-name">{value}</span>
                      <span className="legend-pct">{pct}%</span>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-tags">
            <div className="empty-tags-message">No tags yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
