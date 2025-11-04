import React, { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiDatabase,
  FiActivity,
  FiCalendar,
  FiLoader,
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
      </div>
    </main>
  );
}
