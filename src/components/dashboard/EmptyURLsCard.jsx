import React from "react";
import { motion } from "framer-motion";
import { FiLink, FiPlus } from "react-icons/fi";
import '../CSS/EmptyURLsCard.css'

/**
 * EmptyURLsCard
 * Props:
 *  - onAdd: function called when user clicks Add URL
 *  - title, subtitle, hint (override text)
 *  - size: 'sm' | 'md' | 'lg'
 */
const EmptyURLsCard = ({
  onAdd = () => {},
  title = "No URLs saved yet",
  subtitle = "Start by adding your first URL with notes and reminders",
  hint = "",
  size = "md",
}) => {
  const sizes = {
    sm: { w: "w-[320px]", pad: "px-6 py-8", icon: 12, txt: "text-base" },
    md: { w: "w-[440px]", pad: "px-8 py-12", icon: 16, txt: "text-lg" },
    lg: { w: "w-[640px]", pad: "px-10 py-14", icon: 20, txt: "text-xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="empty-urls-card-wrapper flex items-center justify-center">
      <div
        className={`${s.w} relative ${s.pad} rounded-3xl overflow-hidden flex flex-col items-center text-center empty-urls-card`}
        role="status"
        aria-live="polite"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008))",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 10px 40px rgba(2,6,23,0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Conic halo (soft) */}
        <div
          aria-hidden
          className="empty-urls-card-halo absolute -inset-2 rounded-3xl"
          style={{
            background:
              "conic-gradient(from 200deg, rgba(59,130,246,0.06), rgba(16,185,129,0.05), rgba(168,85,247,0.05))",
            maskImage:
              "radial-gradient(circle at center, rgba(0,0,0,0.85), transparent 60%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, rgba(0,0,0,0.85), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* floating micro-particles for depth */}
        <div aria-hidden className="empty-urls-card-particles absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => {
            const left = 6 + i * 15 + (i % 2) * 5;
            const top = 8 + ((i * 11) % 56);
            const dim = 3 + (i % 3) * 2;
            const delay = i * 0.12;
            return (
              <motion.div
                key={i}
                className="empty-urls-card-particle"
                animate={{
                  y: [0, -6 + (i % 3) * 4, 0],
                  opacity: [0.06, 0.16, 0.06],
                }}
                transition={{
                  duration: 3 + (i % 4) * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
                style={{
                  width: dim,
                  height: dim,
                  left: `${left}%`,
                  top: `${top}%`,
                  position: "absolute",
                  borderRadius: 999,
                  background: "rgba(255,255,255,1)",
                  filter: "blur(1px)",
                }}
              />
            );
          })}
        </div>

        {/* focal icon chip */}
        <motion.div
          className="empty-urls-card-content z-10 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="empty-urls-card-icon flex items-center justify-center rounded-full"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: `${s.icon * 6}px`,
              height: `${s.icon * 6}px`,
              background:
                "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(16,185,129,0.08))",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow:
                "0 14px 30px rgba(59,130,246,0.08), inset 0 -6px 12px rgba(0,0,0,0.25)",
            }}
            aria-hidden
          >
            <FiLink
              className="empty-urls-card-icon-svg text-[18px] text-white/90"
              style={{ fontSize: s.icon * 1.2, color: "#8bdcff" }}
            />
          </motion.div>

          <h3 className={`empty-urls-card-title ${s.txt} font-semibold text-white/90`}>{title}</h3>

          <p className="empty-urls-card-subtitle text-sm text-white/60 max-w-[85%]">{subtitle}</p>
          {hint ? (
            <p className="empty-urls-card-hint text-xs text-white/50 mt-1 max-w-[85%]">{hint}</p>
          ) : null}

          {/* CTA */}
          <button
            onClick={onAdd}
            className="empty-urls-card-add-btn mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-95 transition-transform duration-300"
            style={{
              background:
                "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(16,185,129,0.95))",
              color: "#07101a",
              boxShadow: "0 8px 28px rgba(59,130,246,0.18)",
            }}
            aria-label="Add URL"
          >
            <FiPlus className="empty-urls-card-add-btn-icon text-white" />
            <span className="empty-urls-card-add-btn-text" style={{ color: "#07101a", fontWeight: 700 }}>Add URL</span>
          </button>

          {/* subtle divider */}
          <div
            aria-hidden
            className="empty-urls-card-divider mt-4 h-[1px] w-28 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(99,102,241,0.22), transparent)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default EmptyURLsCard;
