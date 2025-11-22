// FILE: PrivacyPolicy.jsx
// Dependencies: framer-motion (install: npm i framer-motion)

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./CSS/PrivacyPolicy.css"; // kept original stylesheet filename for compatibility
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCommand } from "react-icons/fi";
import HeadMeta from "./meta/HeadMeta";

// Default fallback privacy policy content
const defaultPrivacyData = [
  {
    id: 1,
    title: "Introduction",
    content:
      "Welcome to URL Manager. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform. By accessing or using URL Manager, you consent to the data practices described in this policy.",
  },
  {
    id: 2,
    title: "Information We Collect",
    content:
      "We collect information you voluntarily provide—such as email address, saved URLs, tags, and preferences—as well as automatically collected data including device information, usage analytics, browser type, and interaction patterns. This data helps us improve your experience and maintain platform security.",
  },
  {
    id: 3,
    title: "How We Use Your Information",
    content:
      "We use your information to operate and improve our services, personalize your dashboard, enhance link management features, provide customer support, analyze performance, and ensure security. We do not sell your personal information to third parties.",
  },
  {
    id: 4,
    title: "Data Sharing & Disclosure",
    content:
      "We may share limited information with trusted service providers who assist in hosting, analytics, or security. These partners are contractually bound to protect your information. We may also disclose data when required by law or to protect the rights, property, or safety of URL Manager, our users, or the public.",
  },
  {
    id: 5,
    title: "Data Security",
    content:
      "We implement industry-standard encryption, secure storage practices, and continuous monitoring to protect your information from unauthorized access, alteration, or disclosure. While we take reasonable measures to secure your data, no method of transmission or storage is 100% secure.",
  },
  {
    id: 6,
    title: "Retention",
    content:
      "We retain personal data only for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. Retention periods vary depending on the data type and the purpose for which it was collected.",
  },
  {
    id: 7,
    title: "Your Rights & Choices",
    content:
      "You have the right to access, correct, export, or delete your personal information. You can also manage preferences such as notifications, saved links, and tags. To exercise your rights or request assistance, please contact our privacy team.",
  },
  {
    id: 8,
    title: "Cookies & Tracking",
    content:
      "We use cookies and similar technologies to provide, analyze, and improve our services. You can control cookie preferences via your browser settings or by contacting us. Certain features may require cookies to function correctly.",
  },
  {
    id: 9,
    title: "Third-Party Services",
    content:
      "We may use third-party services (for analytics, payment processing, hosting, etc.) that may collect or process data on our behalf. These providers are authorized to use your data only as necessary to provide their services to URL Manager.",
  },
  {
    id: 10,
    title: "International Transfers",
    content:
      "URL Manager may store and process your information in locations outside your country. When transferring data internationally, we take steps to ensure that it is treated securely and in accordance with this policy and applicable law.",
  },
  {
    id: 11,
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy to reflect new features, technologies, legal requirements, or business practices. We will notify users of significant changes via our platform or email. Continued use of URL Manager after changes indicates acceptance of the updated policy.",
  },
  {
    id: 12,
    title: "Contact Information",
    content:
      "If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact our privacy team at privacy@urlmanager.com.",
  },
];

/*  
  NORMALIZE API POLICY DATA  
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

export default function PrivacyPolicy({
  onClose = () => {},
  privacyData = defaultPrivacyData,
  fetchPrivacyData = () => {},
  canonicalUrl,
}) {
  const [localPolicy, setLocalPolicy] = useState(privacyData);
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
        const result = await fetchPrivacyData();
        const resolved = result instanceof Promise ? await result : result;
        const normalized = normalizeApiTerms(resolved);

        if (mounted) {
          if (normalized && normalized.length > 0) {
            setLocalPolicy(normalized);
          } else {
            setLocalPolicy(
              Array.isArray(privacyData) && privacyData.length
                ? privacyData
                : defaultPrivacyData
            );
          }
        }
      } catch (err) {
        if (mounted) {
          setFetchError(err?.message ?? "Failed to load privacy policy.");
          setLocalPolicy(
            Array.isArray(privacyData) && privacyData.length
              ? privacyData
              : defaultPrivacyData
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILTER (no specific "no matching" message — we keep behavior consistent)
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return localPolicy || [];
    return (localPolicy || []).filter(
      (t) =>
        (t.title || "").toLowerCase().includes(q) ||
        (t.content || "").toLowerCase().includes(q)
    );
  })();

  // Retry API
  function retryFetch() {
    setFetchError(null);
    setIsLoading(true);

    const res = fetchPrivacyData();

    if (res instanceof Promise) {
      res
        .then((resolved) => {
          const normalized = normalizeApiTerms(resolved);
          setLocalPolicy(
            normalized && normalized.length ? normalized : privacyData
          );
        })
        .catch((err) =>
          setFetchError(err?.message ?? "Failed to load privacy policy.")
        )
        .finally(() => setIsLoading(false));
    } else {
      const normalized = normalizeApiTerms(res);
      setLocalPolicy(normalized && normalized.length ? normalized : privacyData);
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
    // a tiny extra delay helps when using framer-motion height animation
    timerRef.current = setTimeout(() => {
      const el = refs.current[id];
      if (el && typeof el.scrollIntoView === "function") {
        // scroll the article to the top of the viewport
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

   
    }, 80); // 80ms usually works well with framer-motion; adjust if you want faster/slower
  });
}


  return (
    <div className="privacy-page-wrap w-full h-full flex flex-col bg-gray-900 text-gray-100">
      <HeadMeta
        canonicalUrl={canonicalUrl}
        title="Privacy Policy — URL Manager"
        description="Review the Privacy Policy for URL Manager to understand how your data is collected, used, and protected. Learn about your rights, our security practices, and how we ensure safe and transparent link management."
        keywords="URL Manager privacy policy, data protection, privacy, user data, link manager privacy, URL management privacy"
        image="og-image.png"
        themeColor="#0b1220"
      />

      <motion.header
        className="privacy-header"
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
          <div className="privacy-title flex items-center justify-between">
            <h2 className="text-3xl font-bold mb-2 text-white">
              Privacy Policy
            </h2>
            <Link to="/" className="privacy-back-btn mr-4">
              <FiArrowLeft size={22} />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* LOADER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="privacy-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loader-card-rich">
              <div className="loader-ring" />
              <div className="loader-texts">
                <div className="loader-title">Loading privacy policy…</div>
                <div className="loader-sub">
                  Fetching the latest privacy policy content.
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

      <main className="privacy-grid">
        {/* TOC */}
        <aside className="toc-panel">
          <ul>
            {(localPolicy || []).map((t, i) => (
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
                className={`${item.id} policy-card ${
                  openId === item.id ? "expanded" : ""
                } ${highlightedId === item.id ? "highlight" : ""}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                ref={(el) => (refs.current[item.id] = el)}
              >
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
                  <h2>{`${(localPolicy || []).indexOf(item) + 1}. ${
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

      <footer className="privacy-footer">
        <small>
          For privacy questions, email:
          <a href="mailto:privacy@urlmanager.com"> privacy@urlmanager.com</a>
        </small>
      </footer>
    </div>
  );
}
