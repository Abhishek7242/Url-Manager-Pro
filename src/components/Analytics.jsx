import React, { useEffect, useMemo, useState } from "react";
import {
  FiBarChart2,
  FiDatabase,
  FiActivity,
  FiCalendar,
  FiLoader,
  FiHash,
} from "react-icons/fi";
import "./CSS/Analytics.css";
import ClicksOverTime from "./analytics/ClicksOverTime"; // inside JSX
import TopTags from "./analytics/TopTags";
import MostVisited from "./analytics/MostVisited";
import RecentlyAdded from "./analytics/RecentlyAdded";
import UrlContext from "../context/url_manager/UrlContext";
import NeonOrbitalLoader from "./NeonOrbitalLoader";

export default function Analytics() {
    const context = React.useContext(UrlContext);
    const { getAllUrls, setUrls, filtered, setScreenLoading } = context;
    
    const [initialLoading, setInitialLoading] = useState(true);
    
    useEffect(() => {
      // define async function inside useEffect
      const fetchUrls = async () => {
        setInitialLoading(true);
        try {
          const res = await getAllUrls(); // call API function
          setUrls(res.data); // save to state
        } catch (err) {
          // console.error("❌ Error fetching URLs:", err);
        } finally {
          setInitialLoading(false);
          setScreenLoading(false)
        }
      };
  
      fetchUrls(); // call it
    }, []);
  
  const tags = useMemo(() => {
    try {
      const tagMap = {};
      (filtered || []).forEach((url) => {
        if (!url || !url.tags || !Array.isArray(url.tags)) return;
        // prefer updated_at ISO if available, otherwise try formatted_updated_at (which might already be formatted)
        // we'll normalize to an ISO for sorting (if possible), and keep a formatted string for display
        const isoCandidate = url.updated_at || url.updated_at_iso || null;
        const altFormatted = url.formatted_updated_at || null;

        url.tags.forEach((tag) => {
          if (!tag) return;
          // compute an ISO date for comparison; if none, keep null
          const parsedISO = isoCandidate ? new Date(isoCandidate) : null;
          // If parsedISO invalid, try to parse altFormatted (best-effort)
          const lastActiveISO =
            parsedISO && !isNaN(parsedISO) ? parsedISO.toISOString() : null;

          // display date preference: if the URL already provides formatted_updated_at use it,
          // otherwise format from lastActiveISO
          const lastActiveFormatted = altFormatted
            ? altFormatted
            : lastActiveISO
            ? formatDate(lastActiveISO)
            : null;

          if (!tagMap[tag]) {
            tagMap[tag] = {
              name: tag,
              count: 1,
              lastActiveISO, // for sorting
              lastActiveFormatted,
            };
          } else {
            tagMap[tag].count++;
            // Update lastActiveISO and formatted if this url is more recent
            if (lastActiveISO) {
              const existingISO = tagMap[tag].lastActiveISO
                ? new Date(tagMap[tag].lastActiveISO)
                : new Date(0);
              const candidate = new Date(lastActiveISO);
              if (candidate > existingISO) {
                tagMap[tag].lastActiveISO = lastActiveISO;
                tagMap[tag].lastActiveFormatted =
                  lastActiveFormatted || formatDate(lastActiveISO);
              }
            } else if (!tagMap[tag].lastActiveISO && lastActiveFormatted) {
              // If we don't yet have any ISO but there is a formatted date available, keep it
              tagMap[tag].lastActiveFormatted =
                tagMap[tag].lastActiveFormatted || lastActiveFormatted;
            }
          }
        });
      });
      return Object.values(tagMap);
    } catch (err) {
      console.error("Error processing tags:", err);
      return [];
    }
  }, [filtered]);
    const mostUsed = useMemo(
      () => [...tags].sort((a, b) => (b.count || 0) - (a.count || 0)),
      [tags]
    );
  const recentTags = useMemo(
    () =>
      [...tags].sort((a, b) => {
        const da = a.lastActiveISO ? new Date(a.lastActiveISO) : new Date(0);
        const db = b.lastActiveISO ? new Date(b.lastActiveISO) : new Date(0);
        return db - da;
      }),
    [tags]
  );

    const byClicks = [...filtered]
      .sort((a, b) => (b.url_clicks || 0) - (a.url_clicks || 0))
      .slice(0, 5);
    const recent = [...filtered]
      .sort(
        (a, b) =>
          new Date(b.formatted_created_at) - new Date(a.formatted_created_at)
      )
    .slice(0, 6);
  // URLs added this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday 00:00
  startOfWeek.setHours(0, 0, 0, 0);

  const addedThisWeek = filtered.filter(link => {
    const created = new Date(link.formatted_created_at);
    return created >= startOfWeek;
  });
  const recentCount = addedThisWeek.length;
  // Compute total clicks from the live urls array
  const totalClicks = filtered.reduce((sum, u) => sum + (u.url_clicks || 0), 0);

  const [brokenCount, setBrokenCount] = useState(0);
  const [healthyCount, setHealthyCount] = useState(0);
  const [checking, setChecking] = useState(false);
  
  useEffect(() => {
    const checkAllUrls = async () => {
      if (!filtered || filtered.length === 0) {
        setBrokenCount(0);
        setHealthyCount(0);
        setChecking(false);
        return;
      }
      
      setChecking(true);
      let broken = 0;
      let healthy = 0;

      const checks = filtered.map(async (u) => {
        try {
          // Skip non-http(s) schemes to avoid CORS / DNS errors
          if (!/^https?:\/\//i.test(u.url)) {
            broken++;
            return;
          }

          // Fire-and-forget HEAD with 4 s timeout; ignore CORS / network failures
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 4000);

          await fetch(u.url, {
            method: "HEAD",
            mode: "no-cors",
            signal: controller.signal,
          }).then(() => {
            // If fetch succeeds, the domain resolved → treat as healthy
            healthy++;
          }).catch(() => {
            /* DNS errors, CORS, timeout, etc. should be counted as broken */
            broken++;
            return;
          });
          clearTimeout(t);
        } catch {
          broken++;
        }
      });

      await Promise.allSettled(checks);
      setBrokenCount(broken);
      setHealthyCount(healthy);
      setChecking(false);
    };

    if (filtered.length) checkAllUrls();
  }, [filtered]);

  const healthPct =
    filtered.length === 0 || (healthyCount === 0 && brokenCount === 0)
      ? 0
      : Math.round((healthyCount / (healthyCount + brokenCount)) * 100);
      
  // If we're still loading initial data, show loading animation
  if (initialLoading) {
    return (
      <div className="relative h-full pt-32 w-full flex items-center justify-center">
        <NeonOrbitalLoader />
      </div>
    );
  }
      
  return (
    <main className="analytics-root flex justify-center items-center">
      <div className="analytics-inner-root flex flex-col gap-20">
        <section className="cards-grid">
          <article className="card">
            <div className="card-head">
              <div className="card-title">Total URLs</div>
              <FiDatabase className="icon" />
            </div>
            <div className="card-value">{filtered.length}</div>
            <div className="card-sub">URLs in your collection</div>
          </article>

          <article className="card">
            <div className="card-head">
              <div className="card-title">Total Clicks</div>
              <FiActivity className="icon" />
            </div>
            <div className="card-value">{totalClicks}</div>
            <div className="card-sub">Times URLs were accessed</div>
          </article>

          <article className="card">
            <div className="card-head">
              <div className="card-title">URL Health</div>
              <div className="health-mini">
                {checking ? (
                  <div className="checking-health">
                    <FiLoader className="spin-icon" /> Checking...
                  </div>
                ) : (
                  <>
                    {healthyCount} healthy, {brokenCount} broken
                  </>
                )}
              </div>
            </div>

            <div className="health-pct">{healthPct.toFixed(1)}%</div>

            <div className="health-bar">
              <div
                className="health-fill"
                style={{ width: `${healthPct}%` }}
                aria-hidden="true"
              />
            </div>

            <div className="card-sub small">--</div>
          </article>

          <article className="card">
            <div className="card-head">
              <div className="card-title">Recent Activity</div>
              <FiCalendar className="icon" />
            </div>
            <div className="card-value">{recentCount}</div>
            <div className="card-sub">URLs added this week</div>
          </article>
        </section>
        <div className="flex gap-20 flex-col">
          <div className="analytics-section">
            <ClicksOverTime />
            <TopTags height={240} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            <MostVisited items={byClicks} />
            <RecentlyAdded items={recent} />
          </div>
        </div>
       <div className="tags-bottom">
                <div className="most-used">
                  <h4 className="section-title">Most Used Tags</h4>
                  {mostUsed.length === 0 ? (
                    <div className="empty-line">No tags available</div>
                  ) : (
                    <ul className="most-list">
                      {mostUsed.map((t, idx) => (
                        <li key={t.name} className="most-item">
                          <div className="rank">{idx + 1}</div>
                          <div className="tag-info">
                            <div className="tag-name">{t.name}</div>
                            <div className="tag-meta">
                              <span className="meta-count">
                                {t.count} URL{t.count > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="right-badge">
                            +{Math.max(0, t.count)} this week
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
    
                <div className="recent-active">
                  <h4 className="section-title">Recently Active</h4>
                  {recent.length === 0 ? (
                    <div className="empty-line">No recent activity</div>
                  ) : (
                    <ul className="recent-list">
                      {recentTags.map((t) => (
                        <li key={t.name} className="recent-item">
                          <div className="ra-left">
                            <FiHash className="ra-icon" />
                            <div>
                              <div className="ra-tag">{t.name}</div>
                              <div className="ra-date">
                                {t.lastActiveFormatted || "—"}
                              </div>
                            </div>
                          </div>
                          <div className="ra-count">{t.count} URLs</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
      </div>
    </main>
  );
}
