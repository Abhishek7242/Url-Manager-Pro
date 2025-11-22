// FILE: TermsAndServices.jsx
// Dependencies: framer-motion (install: npm i framer-motion)

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./CSS/TermsAndServicesPage.css";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCommand } from "react-icons/fi";
import HeadMeta from "./meta/HeadMeta";

// Default fallback terms
const defaultTermsData = [
  {
    id: 1,
    title: "Introduction",
    content:
      "Welcome to URL Manager, your trusted platform for managing and organizing your links. These Terms of Service govern your access to and use of our website, applications, and link management services. By using Linkuss, you acknowledge that you have read, understood, and agree to be bound by these terms.",
  },
  {
    id: 2,
    title: "Account Registration",
    content:
      "To use certain features, you must create an account and provide accurate information. You are responsible for keeping your login credentials confidential and for all activity under your account. Notify us immediately of any unauthorized access.",
  },
];

/*  
  NORMALIZE API TERMS  
  Accepts backend data like:
  [
    {id: 1, title: "...", description: "..."},
    {id: 2, title: "...", description: "..."}
  ]
*/
function normalizeApiTerms(raw) {
  const arr = Array.isArray(raw)
    ? raw
    : raw && Array.isArray(raw.data)
    ? raw.data
    : null;

  if (!arr) return null;

  return arr.map((item, idx) => {
    const numericId = item.id ?? idx + 1; // numeric ID only

    return {
      id: numericId,
      title: item.title ?? `Clause ${numericId}`,
      content: item.description ?? item.content ?? "",
      created_at: item.created_at,
      updated_at: item.updated_at,
      raw: item,
    };
  });
}

export default function TermsAndServicesPage({
  onClose = () => {},
  termsData = defaultTermsData,
  fetchTerms = () => {},
  canonicalUrl,
}) {
  const [localTerms, setLocalTerms] = useState(termsData);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);

  const refs = useRef({});
  const timerRef = useRef(null);

  // FETCH ON LOAD
  useEffect(() => {
    let mounted = true;

    async function loadTerms() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const result = fetchTerms();
        const resolved = result instanceof Promise ? await result : result;
        const normalized = normalizeApiTerms(resolved);

        if (mounted) {
          if (normalized && normalized.length > 0) {
            setLocalTerms(normalized);
          } else {
            setLocalTerms(
              Array.isArray(termsData) && termsData.length
                ? termsData
                : defaultTermsData
            );
          }
        }
      } catch (err) {
        if (mounted) {
          setFetchError(err?.message ?? "Failed to load terms.");
          setLocalTerms(
            Array.isArray(termsData) && termsData.length
              ? termsData
              : defaultTermsData
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadTerms();

    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // FILTER (NO "No matching clauses")
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return localTerms || [];
    return (localTerms || []).filter(
      (t) =>
        (t.title || "").toLowerCase().includes(q) ||
        (t.content || "").toLowerCase().includes(q)
    );
  })();

  // Retry API
  function retryFetch() {
    setFetchError(null);
    setIsLoading(true);

    const res = fetchTerms();

    if (res instanceof Promise) {
      res
        .then((resolved) => {
          const normalized = normalizeApiTerms(resolved);
          setLocalTerms(
            normalized && normalized.length ? normalized : termsData
          );
        })
        .catch((err) => setFetchError(err?.message ?? "Failed to load terms."))
        .finally(() => setIsLoading(false));
    } else {
      const normalized = normalizeApiTerms(res);
      setLocalTerms(normalized && normalized.length ? normalized : termsData);
      setIsLoading(false);
    }
  }

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
    setHighlightedId(id);
  }

function goto(id) {
  // open the card first so its expanded height is available
  setOpenId(id);
  setHighlightedId(id);

  // clear any previous timers
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  // wait until the DOM updates (next paint), then scroll smoothly
  requestAnimationFrame(() => {
    // small extra delay helps when using framer-motion height animation
    timerRef.current = setTimeout(() => {
      const el = refs.current[id];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // clear highlight after 2.5s
      timerRef.current = setTimeout(() => {
        setHighlightedId(null);
        timerRef.current = null;
      }, 2500);
    }, 80); // tweak 80ms if you want faster/slower timing
  });
}


  return (
    <div className="terms-page-wrap w-full h-full flex flex-col bg-gray-900 text-gray-100">
      <HeadMeta
        canonicalUrl={canonicalUrl}
        title="Terms & Conditions — URL Manager"
        description="Read the Terms & Conditions for using URL Manager. Understand the rules, responsibilities, and guidelines that ensure secure, reliable, and transparent link management."
        keywords="URL Manager terms, terms, terms and conditions, user agreement, policies, URL manager policies, link management terms"
        image="og-image.png"
        themeColor="#0b1220"
      />

      <motion.header
        className="terms-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="w-full">
          <div className="flex items-center gap-4 uml-brand border-b border-gray-700 pb-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white uml-brand-mark">
              <div className="brand-icon" aria-hidden>
                <FiCommand />
              </div>
            </div>
            <div className="uml-brand-text">
              <div className="font-extrabold text-lg uml-brand-title">
                URL <span className="text-indigo-400"> Manager</span>
              </div>
              <div className="text-xs text-slate-500 uml-brand-sub">
                Save • Manage • Analyze
              </div>
            </div>
          </div>
          <div className="terms-title flex items-center justify-between">
            <h2 className="text-3xl font-bold mb-2 text-white">
              Terms & Conditions
            </h2>
            <Link to="/" className="terms-back-btn mr-4">
              <FiArrowLeft size={22} />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* LOADER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="terms-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loader-card-rich">
              <div className="loader-ring" />
              <div className="loader-texts">
                <div className="loader-title">Loading terms…</div>
                <div className="loader-sub">
                  Fetching the latest policy content.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR BANNER */}
      <AnimatePresence>
        {!isLoading && fetchError && (
          <motion.div
            className="fetch-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <strong>Error:</strong> {fetchError}
            <button className="btn small" onClick={retryFetch}>
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="terms-grid">
        {/* TOC */}
        <aside className="toc-panel">
          <ul>
            {(localTerms || []).map((t, i) => (
              <li key={t.id}>
                <button
                  className={`toc-btn ${openId === t.id ? "active" : ""}`}
                  onClick={() => goto(t.id)}
                >
                  {`${i + 1}. ${t.title}`}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* CONTENT */}
        <section className="content-panel">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.article
                layout
                key={item.id}
                className={`${item.id} term-card ${
                  openId === item.id ? "expanded" : ""
                } ${highlightedId === item.id ? "highlight" : ""}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                ref={(el) => (refs.current[item.id] = el)}
              >
                {/*
                  NOTE: Read button removed. Clicking the header toggles open/collapse.
                  Header is keyboard-accessible via tab and Enter/Space.
                */}
                <header
                  className="card-header"
                  onClick={() => toggle(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(item.id);
                    }
                  }}
                >
                  <h2>{`${(localTerms || []).indexOf(item) + 1}. ${
                    item.title
                  }`}</h2>
                </header>

                <AnimatePresence>
                  {openId === item.id && (
                    <motion.div
                      className="card-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32 }}
                    >
                      <p>{item.content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
          </AnimatePresence>
        </section>
      </main>

      <footer className="terms-footer">
        <small>
          For questions, email:
          <a href="mailto:legal@urlmg.com"> legal@urlmg.com</a>
        </small>
      </footer>
    </div>
  );
}
