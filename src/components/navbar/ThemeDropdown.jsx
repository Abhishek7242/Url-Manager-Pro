import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";

// Enhanced Animated ThemeDropdown with Light-mode on body behavior
export default function ThemeDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // prefersDark kept in state for reactive system changes
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // theme: "light" | "dark" | "system" (user-selected)
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("site-theme");
    return stored || "system";
  });

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setPrefersDark(e.matches);
    // support both APIs
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // INITIALIZATION: if nothing in localStorage, detect system and store "light" or "dark"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("site-theme");
    if (!stored) {
      const isDark = window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
      const initial = isDark ? "dark" : "light";
      // store initial so subsequent loads use the same fallback
      localStorage.setItem("site-theme", initial);
      setTheme(initial);
      // apply immediately (applyTheme below will also run on theme change)
    }
    // if stored exists we keep the current `theme` state value (set in useState)
  }, []);

  // applyTheme: enforce `.light-mode` on body only for light; remove for dark.
  // Note: When theme === "system" we follow prefersDark but DON'T overwrite localStorage.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.getElementById("landing_page");

    const apply = (t) => {
      if (t === "light") {
        body.classList.add("light-mode");
      } else if (t === "dark") {
        body.classList.remove("light-mode");
      } else if (t === "system") {
        // follow system preference but do not change stored preference
        if (prefersDark) body.classList.remove("light-mode");
        else body.classList.add("light-mode");
      }
    };

    apply(theme);

    // Update localStorage only for explicit light/dark selections (not for "system")
    if (theme === "light" || theme === "dark") {
      try {
        localStorage.setItem("site-theme", theme);
      } catch (e) {
        // ignore quota errors
      }
    }
  }, [theme, prefersDark]);

  const options = [
    {
      key: "light",
      label: "Light",
      icon: <FiSun className="text-yellow-500" />,
    },
    {
      key: "dark",
      label: "Dark",
      icon: <FiMoon className="text-indigo-400" />,
    },
    {
      key: "system",
      label: "System",
      icon: <FiMonitor className="text-gray-400" />,
    },
  ];

  // For the small icon shown on the button: resolve system -> effective theme
  const resolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  return (
    <div className="relative inline-block text-sm " ref={containerRef}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800 transition-all duration-200 focus:outline-none"
        whileTap={{ scale: 0.95 }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          aria-hidden="true"
        >
          {resolvedTheme === "light" ? (
            <FiSun className="text-yellow-400 w-5 h-5" />
          ) : (
            <FiMoon className="text-indigo-400 w-5 h-5" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 6 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="theme-dropdown absolute right-0 mt-2 w-44 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-md"
            role="menu"
          >
            {options.map((opt) => (
              <motion.button
                key={opt.key}
                onClick={() => {
                  setTheme(opt.key);
                  setOpen(false);
                }}
                whileHover={{ x: 4 }}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150 ${
                  theme === opt.key
                    ? "bg-indigo-500 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
                role="menuitem"
              >
                {opt.icon}
                <span className="font-medium">{opt.label}</span>
                {theme === opt.key && (
                  <motion.span
                    layoutId="check"
                    className="ml-auto text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
