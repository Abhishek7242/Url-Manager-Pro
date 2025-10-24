import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import "../CSS/OptimizedCard.css";

const OptimizedCard = () => {
  return (
    <div className="optimized-card-container relative flex items-center justify-center py-10">
      {/* Outer glass container */}
      <div
        className="optimized-card relative w-[420px] overflow-hidden rounded-3xl px-8 py-10 text-center backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 8px 40px rgba(3,8,20,0.7)",
        }}
      >
        {/* Subtle animated conic glow */}
        <motion.div
          className="optimized-card-glow absolute inset-0 rounded-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
          style={{
            background:
              "conic-gradient(from 90deg, rgba(59,130,246,0.12), rgba(167,139,250,0.12), rgba(34,197,94,0.12), rgba(59,130,246,0.12))",
            maskImage:
              "radial-gradient(circle, rgba(0,0,0,1) 45%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(circle, rgba(0,0,0,1) 45%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        <div
          aria-hidden
          className="optimized-card-particles absolute inset-0 pointer-events-none"
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const left = 10 + i * 14 + (i % 2) * 6;
            const top = 10 + ((i * 9) % 50);
            const size = 4 + (i % 3) * 3;
            const opacity = 0.05 + (i % 4) * 0.05;
            return (
              <motion.div
                key={i}
                className="optimized-card-particle absolute rounded-full"
                animate={{ y: [0, -6 + (i % 3) * 3, 0] }}
                transition={{
                  duration: 3 + (i % 4) * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
                style={{
                  width: size,
                  height: size,
                  left: `${left}%`,
                  top: `${top}%`,
                  background: "rgba(255,255,255,0.9)",
                  opacity,
                  filter: "blur(1px)",
                }}
              />
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          className="optimized-card-content relative z-10 flex flex-col items-center justify-center space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated icon circle */}
          <motion.div
            className="optimized-card-icon-wrapper flex items-center justify-center h-20 w-20 rounded-full border border-white/10 bg-gradient-to-br from-green-400/10 to-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.25)]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiTrendingUp className="optimized-card-icon text-4xl text-green-400" />
          </motion.div>

          {/* Title */}
          <h3 className="optimized-card-title text-2xl font-semibold text-white/90 tracking-wide">
            All Optimized!
          </h3>

          {/* Description */}
          <p className="optimized-card-description text-sm text-white/60 max-w-[85%] leading-relaxed">
            Your URL collection is{" "}
            <span className="optimized-card-highlight text-green-400 font-medium">
              well-organized
            </span>
            . <br />
            No suggestions at the moment.
          </p>

          {/* Divider glow */}
          <motion.div
            className="optimized-card-divider mt-4 h-[1px] w-32 rounded-full bg-gradient-to-r from-transparent via-green-400/50 to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default OptimizedCard;
