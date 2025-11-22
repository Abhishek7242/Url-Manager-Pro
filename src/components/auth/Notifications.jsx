import React, { use, useEffect, useState } from "react";
import "../CSS/Notifications.css";
import { FiBell } from "react-icons/fi";

export default function Notifications({
  notifications = [],
  onGetNotifications,
  onClear,
  onClose,
}) {
  const [loading, setLoading] = useState(true);

  const hasNotifications =
    Array.isArray(notifications) && notifications.length > 0;

  useEffect(() => {
    // Fetch notifications when component mounts
    const fetchData = async () => {
      if (onGetNotifications) {
        await onGetNotifications();
      }
      setLoading(false);
    };

    fetchData();
  }, [onGetNotifications]);

  return (
    <aside className="notif-root" role="region" aria-label="Notifications">
      <div className="notif-card">
        {/* Close Button */}
        <button
          className="notif-close"
          onClick={onClose}
          aria-label="Close notifications"
        >
          &times;
        </button>

        <header className="notif-header">
          <div className="notif-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15 17H9m6-7a6 6 0 10-12 0v3l-2 2v1h20v-1l-2-2V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3>Notifications</h3>
          </div>
        </header>

        <div className="notif-body">
          {/* ---- LOADER ---- */}
          {loading && (
            <div className="notif-loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {/* Existing content (unchanged) */}
          {!loading && (
            <>
              {!hasNotifications ? (
                <div className="notif-empty">
                  <div className="notif-empty-illustration" aria-hidden>
                    <span className="ring r1" />
                    <span className="ring r2" />
                  </div>
                  <p className="empty-main">No notifications</p>
                  <p className="empty-sub">
                    You're all caught up — no new alerts.
                  </p>
                </div>
              ) : (
                <ul className="notif-list w-full">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="notif-card-item border p-2 rounded-md"
                    >
                      <div className="notif-card-header">
                        <div className="notif-icon">
                          <FiBell />
                        </div>
                        <div className="notif-card-title">{n.title}</div>
                      </div>

                      {n.description && (
                        <p className="notif-card-desc">{n.description}</p>
                      )}

                      <div className="notif-card-footer">
                        <span className="notif-admin">
                          {n.admin_name || "Admin"}
                        </span>
                        <span className="notif-time">
                          {n.time_ago || n.created_at}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
