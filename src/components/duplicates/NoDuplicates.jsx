import React from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";
import '../CSS/NoDuplicates.css'

const NoDuplicates = () => {
  return (
    <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-3xl bg-transparent backdrop-blur-md nd-root">
      {/* glowing gradient ring */}
      <div className="absolute inset-0 rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-white/[0.01] nd-bg-ring" />
      <motion.div
        className="absolute inset-0 rounded-3xl nd-rotating-glow"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        style={{
          background:
            "conic-gradient(from 0deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1), rgba(59,130,246,0.1))",
          maskImage: "radial-gradient(circle, transparent 50%, black 51%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 50%, black 51%)",
        }}
      />

      {/* content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center px-6 py-10 nd-content"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.25)] nd-icon-wrapper"
        >
          <FiAlertTriangle className="text-4xl text-blue-400 nd-icon" />
        </motion.div>

        <h3 className="text-xl font-semibold text-white/90 nd-title">
          No Duplicates Found
        </h3>
        <p className="mt-2 text-sm text-white/60 max-w-xs nd-description">
          Your URL collection is{" "}
          <span className="text-green-400 font-medium nd-highlight-clean">
            clean
          </span>{" "}
          and perfectly{" "}
          <span className="text-blue-400 font-medium nd-highlight-organized">
            organized
          </span>
          !
        </p>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent nd-glow-line"
        />
      </motion.div>
    </div>
  );
};

export default NoDuplicates;
