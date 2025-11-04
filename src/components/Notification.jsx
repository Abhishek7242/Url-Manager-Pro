import React, { useEffect } from "react";
import "./CSS/Notification.css";
import {
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

/**
 * Props:
 * - type: "success" | "error" | "info" | "warning"
 * - message: string
 * - duration: number (ms)
 * - onClose: function
 */
export default function Notification({
  type = "info",
  message,
  duration = 3000,
  onClose,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose,message]);

  const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    info: <FiInfo />,
    warning: <FiAlertTriangle />,
  };

  return (
    <div className={`notify-card ${type}`}>
      <div className="notify-icon">{icons[type]}</div>
      <div className="notify-content">
        <p className="notify-text">{message}</p>
      </div>
      <button className="notify-close" onClick={onClose}>
        <FiX />
      </button>
      <div
        className="notify-progress"
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
}
