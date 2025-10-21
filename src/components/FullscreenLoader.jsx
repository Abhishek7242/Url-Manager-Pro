import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FullscreenLoader
 *
 * Props:
 *  - isOpen: boolean            // show/hide loader
 *  - message: string | null     // optional small text under loader
 *  - blurAmount: number         // tailwind-like blur strength fallback (e.g. 12 -> "12px" inline)
 *  - transparentBackdrop: bool  // keep dim translucent backdrop
 *
 * Usage:
 *  <FullscreenLoader isOpen={loading} message="Uploading files..." />
 */
export default function FullscreenLoader({
  isOpen = true,
  message = null,
  blurAmount = 15,
  transparentBackdrop = true,
}) {
  const backdropBg = transparentBackdrop
    ? "rgba(0,0,0,0.34)"
    : "rgba(0,0,0,0.55)";
  const blurPx = `${blurAmount}px`;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const card = {
    hidden: { y: 8, scale: 0.98, opacity: 0 },
    visible: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { y: 6, scale: 0.98, opacity: 0, transition: { duration: 0.12 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="fullscreen-loader"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={container}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          aria-hidden={!isOpen}
          aria-busy={isOpen}
          role="status"
        >
          {/* Backdrop: blur + dim */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: backdropBg,
              backdropFilter: `blur(${blurPx}) saturate(1.05)`,
              WebkitBackdropFilter: `blur(${blurPx})`,
            }}
            variants={container}
          />

          {/* Center panel (glass) */}
          <motion.div
            variants={card}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-[min(92%,420px)] max-w-[420px] p-6 rounded-2xl shadow-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Animated ring + dots (SVG + framer animations) */}
              <div className="grid place-items-center">
                <motion.svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(99,102,241,0.95)" />
                      <stop offset="60%" stopColor="rgba(139,92,246,0.95)" />
                      <stop offset="100%" stopColor="rgba(236,72,153,0.95)" />
                    </linearGradient>
                    <filter
                      id="soft"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="3" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* outer faint ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="6"
                    fill="none"
                  />

                  {/* gradient arc (thicker) */}
                  <path
                    d="M 60 16
                       A 44 44 0 1 1 59.99 16"
                    stroke="url(#g1)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="140"
                    strokeDashoffset="25"
                    filter="url(#soft)"
                    style={{ transformOrigin: "60px 60px" }}
                  />

                  {/* three pulsating dots on inner circle placed with small orbit animation */}
                  <g transform="translate(60,60)">
                    {[0, 120, 240].map((ang, i) => {
                      const rad = (ang * Math.PI) / 180;
                      const x = Math.round(Math.cos(rad) * 30);
                      const y = Math.round(Math.sin(rad) * 30);
                      return (
                        <motion.circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="5.5"
                          fill={
                            i === 0
                              ? "rgba(99,102,241,1)"
                              : i === 1
                              ? "rgba(139,92,246,1)"
                              : "rgba(236,72,153,1)"
                          }
                          animate={{
                            scale: [1, 1.65, 1],
                            opacity: [1, 0.6, 1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.05,
                            delay: i * 0.16,
                            ease: "easeInOut",
                          }}
                        />
                      );
                    })}
                  </g>
                </motion.svg>
              </div>

              {/* Title / text */}
              <div className="text-center">
                <div className="text-white text-lg font-semibold tracking-wide">
                  Working on it…
                </div>
                {message ? (
                  <div className="mt-1 text-xs text-white/70">{message}</div>
                ) : (
                  <div className="mt-1 text-xs text-white/60">
                    Please wait a moment
                  </div>
                )}
              </div>

              {/* subtle progress bar (indeterminate) */}
              <div className="w-full mt-3">
                <div
                  className="relative h-1 w-full rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <motion.div
                    className="absolute left-[-35%] top-0 h-full rounded-full"
                    style={{
                      width: "45%",
                      background:
                        "linear-gradient(90deg, rgba(99,102,241,0.95), rgba(139,92,246,0.95), rgba(236,72,153,0.95))",
                      boxShadow: "0 6px 18px rgba(139,92,246,0.12)",
                    }}
                    animate={{ x: ["0%", "120%"] }}
                    transition={{
                      repeat: Infinity,
                      ease: "linear",
                      duration: 1.6,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
