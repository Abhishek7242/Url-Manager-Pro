import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./CSS/NeonOrbitalLoader.css"

/**
 * NeonOrbitalLoader — Enhanced (with classNames)
 * Fully same logic, just structured CSS-friendly class names.
 */

const NeonOrbitalLoader = ({
  isOpen = true,
  size = 88,
  speed = 900,
  palette = ["#60a5fa", "#a78bfa", "#34d399"],
  label = "Loading...",
}) => {
  const orbitCount = 3;
  const dotCount = 10;
  const baseRadius = size / 2.6;
  const coreSize = Math.max(12, Math.round(size * 0.22));

  const orbits = Array.from({ length: orbitCount }).map((_, i) => ({
    r: baseRadius + i * (size * 0.06),
    strokeW: 2 + i,
    speed: (speed / 1000) * (1 + i * 0.35),
    color: palette[i % palette.length],
    blur: 0,
  }));

  const labelId = `neon-loader-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="relative h-screen w-full flex items-center justify-center">
      <AnimatePresence>
        {isOpen && (
          <div
            className="nol-root z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
          >
            {/* backdrop blur */}
            <div className="nol-backdrop absolute inset-0" />

            <div
              className="nol-container pointer-events-auto p-5 rounded-3xl"
              style={{ width: size + 340, maxWidth: "92vw" }}
            >
              <div className="nol-content flex flex-col items-center gap-3">
                <div
                  style={{ width: size, height: size }}
                  className="nol-orbit-wrapper relative"
                >
                  {/* layered orbits */}
                  {orbits.map((o, idx) => (
                    <motion.svg
                      key={idx}
                      width={size}
                      height={size}
                      viewBox={`0 0 ${size} ${size}`}
                      className="nol-orbit absolute inset-0"
                      style={{ filter: `drop-shadow(0 8px 18px ${o.color}33)` }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: o.speed,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    >
                      <defs>
                        <linearGradient id={`grad-${idx}`} x1="0" x2="1">
                          <stop
                            offset="0%"
                            stopColor={o.color}
                            stopOpacity="0.95"
                          />
                          <stop
                            offset="60%"
                            stopColor={o.color}
                            stopOpacity="0.25"
                          />
                          <stop
                            offset="100%"
                            stopColor={o.color}
                            stopOpacity="0.06"
                          />
                        </linearGradient>
                      </defs>

                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={o.r}
                        fill="none"
                        stroke={`url(#grad-${idx})`}
                        strokeWidth={o.strokeW}
                        strokeLinecap="round"
                        className="nol-orbit-ring"
                      />

                      {/* orbit tech marks */}
                      <g className="nol-techmarks" opacity="0.12">
                        {Array.from({ length: 18 }).map((_, k) => {
                          const ang = (k / 18) * Math.PI * 2;
                          const x1 = size / 2 + Math.cos(ang) * (o.r - 4);
                          const y1 = size / 2 + Math.sin(ang) * (o.r - 4);
                          const x2 = size / 2 + Math.cos(ang) * (o.r + 4);
                          const y2 = size / 2 + Math.sin(ang) * (o.r + 4);
                          return (
                            <line
                              key={k}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#fff"
                              strokeWidth="0.6"
                              strokeLinecap="round"
                              className="nol-techmark-line"
                            />
                          );
                        })}
                      </g>
                    </motion.svg>
                  ))}

                  {/* comet */}
                  <motion.div
                    className="nol-comet absolute"
                    style={{ width: size, height: size }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: (speed / 1200) * 0.9,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  >
                    <motion.div
                      initial={{ x: size * 0.5 - 6, y: 0 }}
                      animate={{ x: size * 0.5 - 6, y: 0 }}
                      className="nol-comet-container absolute"
                      style={{ left: 0, top: 0, pointerEvents: "none" }}
                    >
                      <div
                        className="nol-comet-trail relative"
                        style={{ left: size / 2 - 6 }}
                      >
                        <div
                          className="nol-comet-head"
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 99,
                            background: palette[0],
                            boxShadow: `0 10px 30px ${palette[0]}33`,
                            transform: "translateZ(0)",
                          }}
                        />
                        <div
                          className="nol-comet-tail absolute"
                          style={{
                            left: -40,
                            top: 4,
                            width: 120,
                            height: 8,
                            background: `linear-gradient(90deg, ${palette[0]}33, ${palette[0]}11, transparent)`,
                            filter: "blur(10px)",
                            borderRadius: 8,
                          }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* tech core */}
                  <motion.div
                    className="nol-core absolute left-1/2 top-1/2"
                    style={{ transform: "translate(-50%,-50%)" }}
                    animate={{ rotate: [0, 14, -10, 0] }}
                    transition={{
                      duration: speed / 1000,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      width={coreSize}
                      height={coreSize}
                      viewBox="0 0 48 48"
                      className="nol-core-svg"
                    >
                      <defs>
                        <linearGradient id="coreGrad" x1="0" x2="1">
                          <stop
                            offset="0%"
                            stopColor={palette[1]}
                            stopOpacity="0.95"
                          />
                          <stop
                            offset="100%"
                            stopColor={palette[2]}
                            stopOpacity="0.9"
                          />
                        </linearGradient>
                      </defs>

                      <polygon
                        points="24,6 38,18 32,38 16,38 10,18"
                        fill="rgba(255,255,255,0.02)"
                        stroke="url(#coreGrad)"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        className="nol-core-shape"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="6"
                        fill={palette[2]}
                        opacity="0.95"
                        className="nol-core-center"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* label */}
                <div
                  className="nol-label text-sm text-white/90 font-medium"
                  id={labelId}
                >
                  {label}
                </div>

                {/* subtext */}
                <div className="nol-subtext text-xs text-white/60">
                  This may take a few seconds — we’re aligning the nodes.
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeonOrbitalLoader;

/* Demo wrapper */
export const NeonOrbitalDemo = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="nol-demo min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#07101a] p-6">
      <div className="nol-demo-container space-y-4 w-full max-w-xl">
        <div className="nol-demo-buttons flex gap-2">
          <button
            onClick={() => setOpen((s) => !s)}
            className="nol-btn px-4 py-2 rounded-lg bg-white/6 border border-white/6"
          >
            Toggle
          </button>
          <button
            onClick={() => navigator.vibrate && navigator.vibrate(50)}
            className="nol-btn px-4 py-2 rounded-lg bg-white/6 border border-white/6"
          >
            Tactile
          </button>
        </div>

        <NeonOrbitalLoader
          isOpen={open}
          size={112}
          speed={900}
          palette={["#60a5fa", "#a78bfa", "#34d399"]}
          label="Syncing data"
        />
      </div>
    </div>
  );
};
