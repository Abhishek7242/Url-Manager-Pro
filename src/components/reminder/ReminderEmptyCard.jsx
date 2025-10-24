import React from "react";
import { motion } from "framer-motion";
import { FiBell } from "react-icons/fi";
import "../CSS/ReminderEmptyCard.css";

/**
 * ReminderEmptyCard (with unique classnames)
 */
const ReminderEmptyCard = ({
  title = "All Caught Up",
  subtitle = "No active reminders",
  hint = "Set reminders when adding or editing URLs to see them here.",
  size = "md",
}) => {
  const sizes = {
    sm: { w: "w-[320px]", icon: 14, pad: "px-6 py-8" },
    md: { w: "w-[420px]", icon: 18, pad: "px-8 py-10" },
    lg: { w: "w-[560px]", icon: 22, pad: "px-10 py-12" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center justify-center rec-root`}>
      <div
        className={`${s.w} relative overflow-hidden rounded-2xl ${s.pad} flex flex-col items-center text-center rec-card`}
        role="status"
        aria-live="polite"
        aria-label={title}
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* subtle neon halo ring */}
        <div
          aria-hidden
          className="absolute -inset-2 rounded-2xl rec-halo"
          style={{
            background:
              "conic-gradient(from 90deg, rgba(96,165,250,0.06), rgba(167,139,250,0.06), rgba(52,211,153,0.06))",
            maskImage:
              "radial-gradient(circle at center, rgba(0,0,0,0.9), transparent 60%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, rgba(0,0,0,0.9), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* animated floating particles */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none rec-particles"
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const left = 6 + i * 12 + (i % 2) * 4;
            const top = 8 + ((i * 7) % 32);
            const sizePx = 4 + (i % 3) * 2;
            const opacity = 0.05 + (i % 3) * 0.04;
            return (
              <motion.div
                key={i}
                className="rec-particle"
                animate={{ y: [0, -8 + (i % 3) * 4, 0] }}
                transition={{
                  duration: 3 + (i % 4) * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }}
                style={{
                  width: sizePx,
                  height: sizePx,
                  left: `${left}%`,
                  top: `${top}%`,
                  position: "absolute",
                  borderRadius: 99,
                  background: "rgba(255,255,255,1)",
                  opacity,
                  filter: "blur(1px)",
                }}
              />
            );
          })}
        </div>

        {/* core content */}
        <motion.div
          className="z-10 flex flex-col items-center gap-4 rec-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* bell icon wrapper */}
          <motion.div
            className="flex items-center justify-center rounded-full rec-icon-wrapper"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: `${s.icon * 5}px`,
              height: `${s.icon * 5}px`,
              background:
                "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(167,139,250,0.06))",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow:
                "0 8px 28px rgba(99,102,241,0.08), inset 0 -6px 12px rgba(0,0,0,0.25)",
            }}
          >
            <FiBell
              className="text-white rec-icon"
              style={{ fontSize: s.icon * 1.1, color: "#93c5fd" }}
            />
          </motion.div>

          {/* text sections */}
          <h2 className="text-2xl font-semibold text-white/90 leading-tight rec-title">
            {title}
          </h2>
          <p className="text-sm text-white/60 rec-subtitle">{subtitle}</p>
          <p className="mt-1 text-xs text-white/50 max-w-[85%] rec-hint">
            {hint}
          </p>

          {/* divider */}
          <motion.div
            className="mt-4 h-[1px] w-24 rounded-full rec-divider"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)",
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            aria-hidden
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ReminderEmptyCard;
