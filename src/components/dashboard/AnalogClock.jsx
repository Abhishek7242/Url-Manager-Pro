import React, { useEffect, useState } from "react";
import "../CSS/AnalogClock.css";

export default function AnalogClock() {
  const [time, setTime] = useState(new Date());

  // Update clock every second (using IST time)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + 5.5 * 3600000); // UTC +5:30
      setTime(ist);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate angles for clock hands
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6; // 360° / 60s
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="clock-wrapper">
      <div className="clock-container">
        <div className="clock">
          <div
            className="hand hour"
            style={{ transform: `rotate(${hourDeg}deg)` }}
          />
          <div
            className="hand minute"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />
          <div
            className="hand second"
            style={{ transform: `rotate(${secondDeg}deg)` }}
          />
          <div className="center-dot" />
        </div>
      </div>

      <div className="clock-label">🕒 This feature will be added soon</div>
    </div>
  );
}
