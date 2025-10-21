import React, { useEffect, useMemo, useState } from "react";
import { FiBell, FiLink, FiLoader } from "react-icons/fi";
import UrlContext from "../context/url_manager/UrlContext";
import "./CSS/Reminders.css";
import NeonOrbitalLoader from "./NeonOrbitalLoader";
import ReminderEmptyCard from "./reminder/ReminderEmptyCard";

const Reminders = () => {
  const context = React.useContext(UrlContext);
  const {
    urls = [],
    getAllUrls,
    setUrls,
    filtered,
    updateClickCount,
    setScreenLoading,
  } = context || {};

  const [loading, setLoading] =useState(true);

  useEffect(() => {
    // If URLs already present (e.g., loaded by Dashboard), stop loading
    if ((filtered || []).length > 0) {
      setTimeout(() => {
        setLoading(false);
        
      }, 800);
      setScreenLoading(false)
      return;
    }

    let isMounted = true;
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls?.();
        if (isMounted && res?.data) setUrls?.(res.data);
      } catch (err) {
        console.error("❌ Error fetching URLs for reminders:", err);
      } finally {
        if (isMounted) setLoading(false);
setScreenLoading(false);

      }
    };

    if (getAllUrls && setUrls) fetchUrls();

    return () => {
      isMounted = false;
    };
  }, []);

  const reminders = useMemo(() => {
    const withReminder = (filtered || []).filter((u) => !!u.reminder_at);
    return withReminder
      .slice()
      .sort((a, b) => new Date(a.reminder_at) - new Date(b.reminder_at));
  }, [filtered]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getBadge = (dateStr) => {
    const d = new Date(dateStr);
    const cmp = new Date(d);
    cmp.setHours(0, 0, 0, 0);
    if (cmp.getTime() < today.getTime())
      return { text: "Overdue", cls: "overdue" };
    if (cmp.getTime() === today.getTime())
      return { text: "Due today", cls: "due-today" };
    return { text: "Upcoming", cls: "upcoming" };
  };

  // Show loading state while fetching data (same style as Dashboard)
  if (loading) {
    return (
      <div className="relative h-full pt-32 w-full flex items-center justify-center">
        <NeonOrbitalLoader />
      </div>
    );
  }

  return (
    <div className="reminders-page">
      {reminders.length === 0 ? (
       <ReminderEmptyCard/>
      ) : (
        <div className="reminders-list">
          <div className="reminders-header">
            <div className="reminders-header-left">
              <div className="reminders-icon-wrap">
                <FiBell />
              </div>
              <div className="reminders-titles">
                <h2>Reminders</h2>
                <p className="reminders-subtitle">
                  Never miss a link you wanted to revisit
                </p>
              </div>
            </div>
            <span className="count-pill">{reminders.length}</span>
          </div>
          <ul className="reminders-ul">
            {reminders.map((item) => {
              const badge = getBadge(item.reminder_at);
              return (
                <li key={item.id || item.url} className="reminder-item">
                  <div className="reminder-left">
                    <div className="reminder-title-row">
                      <FiLink className="reminder-link-icon" />
                      <a
                        onClick={() => updateClickCount(item.id)}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="reminder-title"
                        title={item.url}
                      >
                        {item.title || item.url}
                      </a>
                    </div>
                    {item.description ? (
                      <div className="reminder-note">{item.description}</div>
                    ) : null}
                  </div>
                  <div className="reminder-right">
                    <div className={`reminder-badge ${badge.cls}`}>
                      {badge.text}
                    </div>
                    <div className="reminder-date">
                      {formatDate(item.reminder_at)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Reminders;
