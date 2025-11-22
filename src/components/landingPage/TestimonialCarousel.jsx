import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/TestimonialCarousel.css";

/**
 * TestimonialCarousel (redesigned)
 * - Tailwind-first styling (no separate CSS required)
 * - Centered card with smooth slide + fade animations
 * - Avatar with initials, author, role and quote
 * - Autoplay with pause-on-hover, keyboard support, and prev/next buttons
 * - Responsive: shows large card on desktop, compact on mobile
 *
 * Usage: <TestimonialCarousel items={...} autoplay={3000} />
 */

const DEFAULT_TESTIMONIALS = [
  {
    id: "t1",
    quote:
      "I used to lose my bookmarks constantly. URL Manager made my research flow 10x faster.",
    author: "A. Sharma",
    role: "PhD candidate",
  },
  {
    id: "t2",
    quote: "Great UI and search — finding saved links is instant.",
    author: "Priya",
    role: "Frontend Engineer",
  },
  {
    id: "t3",
    quote: "Duplicate cleanup cured years of bookmark chaos.",
    author: "Ravi",
    role: "DevOps Enthusiast",
  },
  {
    id: "t4",
    quote: "Saved my team's time — love the tagging system.",
    author: "Ravi Kumar",
    role: "Product Manager",
  },
  {
    id: "t5",
    quote: "Solid browser integration and healthy link checks.",
    author: "Meena",
    role: "QA Engineer",
  },
];

function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TestimonialCarousel({
  items = DEFAULT_TESTIMONIALS,
  autoplay = 4000, // ms; falsy to disable
}) {
  const list =
    Array.isArray(items) && items.length ? items : DEFAULT_TESTIMONIALS;
  const [index, setIndex] = useState(0);
  const mountedRef = useRef(true);
  const hoverRef = useRef(false);

  const next = useCallback(() => {
    setIndex((s) => (s + 1) % list.length);
  }, [list.length]);

  const prev = useCallback(() => {
    setIndex((s) => (s - 1 + list.length) % list.length);
  }, [list.length]);

  // autoplay
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      if (!hoverRef.current && mountedRef.current) next();
    }, autoplay);
    return () => clearInterval(id);
  }, [autoplay, next]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const active = list[index];
  const left = list[(index - 1 + list.length) % list.length];
  const right = list[(index + 1) % list.length];

  return (
    <section id="testimonials" className="w-full max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6 flex-wrap">
        <h3 className="text-3xl md:text-4xl font-extrabold">
          What our users say
        </h3>
        <div className="text-sm text-slate-500">
          Trusted by researchers & teams
        </div>
      </div>

      <div
        className="testimonial-container relative bg-gradient-to-r from-slate-50 to-white/60 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg p-6 md:p-10 overflow-hidden"
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute -right-20 -top-12 w-56 h-56 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -left-28 -bottom-8 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />

        <div className="flex items-center gap-4 md:gap-2">
          {/* Prev preview (small) */}
          <div className="hidden md:flex md:w-48 lg:w-56 items-center justify-center">
            <motion.div
              key={left?.id}
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="prev-preview -40 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-3">
                <div className="prev-preview-avatar w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-lg font-semibold">
                  {initials(left?.author)}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{left?.author}</div>
                  <div className="text-xs text-slate-500">{left?.role}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main card */}
          <div className="flex-1">
            <div className="relative">
              <AnimatePresence initial={false} mode="wait">
                <motion.blockquote
                  key={active.id}
                  initial={{ opacity: 0, y: 12, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.45 }}
                  className="review-container bg-gradient-to-b from-white to-white/90 dark:from-slate-900 dark:to-slate-900/95 p-2 md:p-2 rounded-2xl shadow-md border border-white/30 dark:border-slate-800/40"
                >
                  <div className="flex items-start gap-4 md:gap-2">
                    <div className="flex-shrink-0">
                      <div className="testimonial-avatar w-16 h-16 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600">
                        {initials(active.author)}
                      </div>
                    </div>

                    <div>
                      <p className="text-lg md:text-xl font-medium leading-relaxed">
                        “{active.quote}”
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <div>
                          <div className="font-semibold">{active.author}</div>
                          <div className="text-sm text-slate-500">
                            {active.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.blockquote>
              </AnimatePresence>

              {/* Prev / Next buttons */}
              {/* <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="rounded-full p-2 hover:scale-105 active:scale-95 transition-transform bg-white/80 dark:bg-slate-800/70 shadow-sm border"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label="Next testimonial"
                  className="rounded-full p-2 hover:scale-105 active:scale-95 transition-transform bg-white/80 dark:bg-slate-800/70 shadow-sm border"
                >
                  ›
                </button>
              </div> */}
            </div>

            {/* Dots */}
            <div className="mt-4 flex items-center gap-2 justify-center md:justify-start">
              {list.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === index
                      ? "w-9 bg-slate-800 dark:bg-white"
                      : "bg-slate-300/80 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Next preview (small) */}
          <div className=" hidden md:flex md:w-48 lg:w-56 items-center justify-center">
            <motion.div
              key={right?.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="next-preview w-40 p-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-3">
                <div className="next-preview-avatar w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-lg font-semibold">
                  {initials(right?.author)}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{right?.author}</div>
                  <div className="text-xs text-slate-500">{right?.role}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Small caption */}
      <div className="mt-4 text-xs text-slate-500 text-center md:text-left">
        Real users · Verified feedback
      </div>
    </section>
  );
}
