// FILE: src/UrlmgrLanding.jsx
// Full React component (JSX). Save as src/UrlmgrLanding.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./CSS/URLMgrLanding.css";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import {
  ArrowRight,
  Settings,
  Shield,
  BarChart2,
  Copy,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import dashboardPreview from "../assets/dashboard-preview.png";
import dashboardPreviewDark from "../assets/dashboard-preview-dark.png";
import UrlContext from "../context/url_manager/UrlContext";

import ThemeDropdown from "./navbar/ThemeDropdown";
import { Helmet } from "react-helmet";
import { useRef } from "react";
import { useCallback } from "react";

export default function URLMgrLanding() {
  const context = React.useContext(UrlContext);
  const {
    addUrl,
    getAllUrls,
    setUrls,
    showNotify,
    archive,
    fetchAndLogUser,
    logout,
    user,
    setUser,
    userInfoData,
    setUserInfoData,
    themeImage,
    setThemeImage,
  } = context || {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [managed, setManaged] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isManageLoading, setIsManageLoading] = useState(false);
  const [openVerifyOTPModel, setOpenVerifyOTPModel] = useState(false);
  const [openLoginModel, setOpenLoginModel] = useState(false);
  const [openSignupModel, setOpenSignupModel] = useState(false);

  const [url, setUrl] = useState("");

  const navigate = useNavigate();

  // set theme from localStorage / system
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem("site-theme");
    if (storedTheme) setThemeImage && setThemeImage(storedTheme);
  }, [setThemeImage]);
  // inside URLMgrLanding component (add near other useEffect's)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => document.body.classList.remove("sidebar-open");
  }, [mobileOpen]);

  const wrapperRef = useRef(null);

  const triggerDropdownToggle = useCallback(() => {
    if (!wrapperRef.current) return;

    // 1️⃣ Find internal toggle button from ThemeDropdown
    const internalBtn =
      wrapperRef.current.querySelector('button[aria-haspopup="true"]') ||
      wrapperRef.current.querySelector("button");
    if (!internalBtn) return;

    // 2️⃣ Check if dropdown menu is open (exists in DOM)
    const dropdownMenu = document.querySelector(".absolute.right-0.mt-2.w-44");

    // 3️⃣ Click the internal button to toggle opposite state
    // (if open -> close, if closed -> open)
    if (dropdownMenu) {
      // Dropdown is currently open, so close it
      internalBtn.click();
    } else {
      // Dropdown is closed, so open it
      setTimeout(() => internalBtn.click(), 0);
    }

    // Ensure focus is on the dropdown button for accessibility
    internalBtn.focus();
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerDropdownToggle();
    }
  };

  async function handleManage(e) {
    e.preventDefault();
    if (isManageLoading) return;
    if (!url.trim()) {
      showNotify && showNotify("error", "Please enter a URL.");
      return;
    }
    setIsManageLoading(true);

    const newLink = {
      title: `Link ${new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      url: url.trim(),
      description: "no Note added",
      status: archive ? "archived" : "active",
      tags: [],
      url_clicks: 0,
      id: Date.now().toString(),
    };

    try {
      setUrls && setUrls((prevUrls) => [newLink, ...(prevUrls || [])]);
      let res = addUrl ? await addUrl(newLink) : null;
      navigate(`/dashboard`);
      if (res) {
        showNotify && showNotify("success", "URL added successfully!");
        const refreshedUrls = getAllUrls ? await getAllUrls() : null;
        if (refreshedUrls && refreshedUrls.data) {
          setUrls && setUrls(refreshedUrls.data);
        }
      }
    } catch (error) {
      showNotify && showNotify("error", "Failed to add URL");
      setUrls &&
        setUrls((prevUrls) =>
          (prevUrls || []).filter((u) => u.id !== newLink.id)
        );
    } finally {
      setIsManageLoading(false);
      setUrl("");
    }
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("copy failed", e);
    }
  }

  function handleSubscribe(e) {
    e?.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  }

  const heroText = {
    hidden: { opacity: 0, y: 18 },
    show: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, ease: "easeOut" },
    }),
  };
  const cardVariant = {
    hidden: { opacity: 0, y: 24 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.12 * i, type: "spring", stiffness: 120 },
    }),
  };

  // canonical url (update if deploying to subpath)
  const canonicalUrl = "https://urlmg.com/";

  return (
    <div id="landing_page" className={`min-h-screen antialiased uml-root`}>
      {/* SEO Meta + Structured Data */}
      <Helmet>
        <html lang="en" />
        <title>URLMgr — Manage, Brand & Measure Short Links</title>
        <meta
          name="description"
          content="URLMgr centralises link operations: custom domains, campaign tracking, governance and team workflows — fast and delightful UI."
        />
        <meta
          name="keywords"
          content="url manager, save link, save url, short links, link management, link analytics, custom domains, campaign tracking"
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="URLMgr — Manage, Brand & Measure Short Links"
        />
        <meta
          property="og:description"
          content="Centralise link operations: custom domains, campaign tracking, governance and team workflows."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="URLMgr" />
        <meta property="og:image" content={`${canonicalUrl}og-image.png`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="URLMgr — Manage, Brand & Measure Short Links"
        />
        <meta
          name="twitter:description"
          content="Centralise link operations: custom domains, campaign tracking, governance and team workflows."
        />
        <meta name="twitter:image" content={`${canonicalUrl}og-image.png`} />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${canonicalUrl}#website`,
                url: canonicalUrl,
                name: "URLMgr",
                description:
                  "URLMgr centralises link operations: custom domains, campaign tracking, governance and team workflows.",
                publisher: {
                  "@type": "Organization",
                  name: "URLMgr",
                  url: canonicalUrl,
                },
              },
              {
                "@type": "Organization",
                "@id": `${canonicalUrl}#org`,
                name: "URLMgr",
                url: canonicalUrl,
                logo: `${canonicalUrl}logo.png`,
              },
              {
                "@type": "SoftwareApplication",
                name: "URLMgr",
                operatingSystem: "Web",
                applicationCategory: "BusinessApplication",
                url: canonicalUrl,
                description:
                  "Link management, analytics and brand controls for teams and enterprises.",
              },
            ],
          })}
        </script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Helmet>

      {/* NAV */}
      {openLoginModel && (
        <Login
          isOpen={openLoginModel}
          setOpenSignupModel={setOpenSignupModel}
          isSignUp={openSignupModel}
          onClose={() => setOpenLoginModel(false)}
          className="uml-login-modal"
        />
      )}
      {openSignupModel && (
        <Signup
          isLogin={openLoginModel}
          isSignUp={openSignupModel}
          onClose={() => setOpenSignupModel(false)}
          setOpenLoginModel={setOpenLoginModel}
          setOpenVerifyOTPModel={setOpenVerifyOTPModel}
          className="uml-signup-modal"
        />
      )}

      <nav className="backdrop-blur sticky top-0 z-50 bg-white/60 dark:bg-slate-900/60 border-b border-white/5 uml-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between uml-nav-inner">
          <div className="flex items-center gap-4 uml-brand">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white uml-brand-mark">
              UM
            </div>
            <div className="uml-brand-text">
              <div className="font-extrabold text-lg uml-brand-title">
                URL<span className="text-indigo-400">Mgr</span>
              </div>
              <div className="text-xs text-slate-500 uml-brand-sub">
                Manage • Brand • Analyze
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 uml-nav-links">
            <a
              href="#features"
              className="text-sm hover:text-indigo-400 transition uml-nav-link"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm hover:text-indigo-400 transition uml-nav-link"
            >
              Pricing
            </a>

            <button
              onClick={() => {
                setOpenLoginModel(true);
              }}
              className="px-4 py-2 text-white rounded-full shadow-lg font-semibold uml-signin-btn"
              aria-label="Sign in"
            >
              Sign In
            </button>

            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-full shadow-lg font-semibold uml-getstarted-btn"
              aria-label="Get started — dashboard"
            >
              Get Started
            </Link>
            <ThemeDropdown />
          </div>

          <div className="md:hidden flex items-center gap-2 uml-mobile-controls">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-full bg-white/5 uml-mobile-menu-toggle"
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* ========= MOBILE SIDEBAR (moved outside <nav>) ========= */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="uml-mobile-overlay"
                onClick={() => setMobileOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
              />

              {/* sidebar */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="uml-mobile-sidebar"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  zIndex: 9999,
                  width: "100%",
                  maxWidth: "320px",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white">
                      UM
                    </div>
                    <div>
                      <div className="font-semibold">URLMgr</div>
                      <div className="text-xs text-slate-400">
                        Manage • Brand • Analyze
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-full uml-mobile-close-btn"
                  >
                    <X />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href="#features"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 uml-mobile-link"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 uml-mobile-link"
                  >
                    Pricing
                  </a>
                  {/* <a
                    href="#integrations"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 uml-mobile-link"
                  >
                    Integrations
                  </a> */}
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6 uml-mobile-actions">
                  <div
                    ref={wrapperRef}
                    className="mb-4 actions-links"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      // Prevent double-trigger if the actual ThemeDropdown button was clicked directly
                      const targetTag =
                        e.target && e.target.tagName?.toLowerCase();
                      if (
                        targetTag === "button" ||
                        e.target.closest?.("button")
                      )
                        return;

                      triggerDropdownToggle();
                    }}
                    onKeyDown={onKeyDown}
                    aria-label="Toggle theme dropdown"
                  >
                    <span className="theme-label" style={{ marginRight: 8 }}>
                      🎨 Themes
                    </span>

                    <ThemeDropdown />
                  </div>

                  <button
                    onClick={() => {
                      setOpenLoginModel(true);
                      setMobileOpen(false);
                    }}
                    className="w-full px-4 py-2 rounded-full text-sm font-semibold uml-signin-btn"
                  >
                    Sign In
                  </button>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block mt-3 w-full text-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold uml-getstarted-btn"
                    aria-label="Get started — dashboard"
                  >
                    Get Started
                  </Link>
                </div>

                <div className="mt-6 text-xs text-slate-400">
                  © {new Date().getFullYear()} URLMgr
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <header className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center uml-hero">
        <div className="uml-hero-left">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 uml-hero-title"
            initial="hidden"
            animate="show"
            custom={0}
            variants={heroText}
          >
            Manage links with confidence — beautiful links, powerful insights.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={1}
            variants={heroText}
            className="mt-6 text-lg text-slate-400 uml-hero-sub"
          >
            URLMgr centralises link operations: custom domains, campaign
            tracking, governance and team workflows — all in a fast, delightful
            UI.
          </motion.p>

          {/* When mobile menu is open on very small screens — show prominent Get Started above the manage form as requested */}
          <div className="mt-6 mobile-get-Started-btn justify-center">
            <Link
              to="/dashboard"
              className="inline-block px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold uml-getstarted-mobile"
            >
              Get Started
            </Link>
          </div>

          <motion.form
            initial="hidden"
            animate="show"
            custom={2}
            variants={heroText}
            onSubmit={handleManage}
            className="mt-8 flex gap-3 max-w-xl uml-hero-form"
            role="search"
          >
            <input
              aria-label="URL"
              required
              value={url}
              placeholder="Enter URL to manage"
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-full px-5 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uml-hero-input"
            />
            <button
              type="submit"
              disabled={isManageLoading}
              className={`px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition ${
                isManageLoading ? "opacity-75 cursor-not-allowed" : ""
              } uml-hero-manage-btn`}
              aria-label="Manage URL"
            >
              {isManageLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white uml-loading-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Manage <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            className="mt-6 flex gap-4 text-sm text-slate-400 uml-hero-features"
          >
            <div className="flex items-center gap-2 uml-feature-item">
              <span className="w-2 h-2 rounded-full bg-indigo-400 uml-feature-dot" />{" "}
              Custom domains
            </div>
            <div className="flex items-center gap-2 uml-feature-item">
              <span className="w-2 h-2 rounded-full bg-sky-400 uml-feature-dot" />{" "}
              Analytics
            </div>
            <div className="flex items-center gap-2 uml-feature-item">
              <span className="w-2 h-2 rounded-full bg-green-400 uml-feature-dot" />{" "}
              Enterprise security
            </div>
          </motion.div>

          <AnimatePresence>
            {managed && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 max-w-xl bg-white/5 dark:bg-white/5 border border-white/6 rounded-2xl p-4 flex items-center justify-between shadow-lg uml-managed-card"
              >
                <div className="uml-managed-left">
                  <div className="text-xs text-slate-300 uml-managed-label">
                    Managed URL
                  </div>
                  <div className="font-semibold uml-managed-url">
                    {managed.url}
                  </div>
                  <div className="text-xs text-slate-400 uml-managed-original">
                    Original: {managed.original}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 uml-managed-right">
                  <div className="text-xs text-slate-400 uml-managed-clicks-label">
                    Clicks
                  </div>
                  <div className="font-bold uml-managed-clicks">
                    {managed.clicks}
                  </div>
                  <div className="flex gap-2 uml-managed-actions">
                    <button
                      onClick={() => copyToClipboard(managed.url)}
                      className="px-3 py-1 rounded-full bg-indigo-600 text-white flex items-center gap-2 uml-copy-btn"
                      aria-label="Copy managed url"
                    >
                      Copy <Copy size={14} />
                    </button>
                    <a
                      className="px-3 py-1 rounded-full border uml-open-btn"
                      href={managed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {copied && (
            <div className="mt-3 text-sm text-green-400 uml-copied-notice">
              Copied ✓
            </div>
          )}
        </div>

        {/* Right visual: preview + floating stat cards */}
        <div className="relative uml-preview-col">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 90 }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent uml-preview-card"
          >
            <img
              src={
                themeImage === "dark" ? dashboardPreviewDark : dashboardPreview
              }
              alt="URLMgr dashboard preview showing analytics and links list"
              className="w-full h-[360px] object-cover uml-preview-image"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="absolute -left-6 -bottom-10 w-56 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-4 shadow-2xl uml-preview-stat"
          >
            <div className="text-xs uml-preview-stat-label">Total clicks</div>
            <div className="text-2xl font-bold mt-1 uml-preview-stat-value">
              1.2M
            </div>
            <div className="text-xs mt-2 opacity-90 uml-preview-stat-sub">
              Realtime • Global
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute dark:bg-slate-800 dark:border-slate-700 -right-6 -top-8 w-48 bg-white rounded-2xl p-3 shadow-lg border uml-preview-topreferrer"
          >
            <div className="text-xs text-slate-500 uml-preview-ref-label">
              Top referrer
            </div>
            <div className="font-semibold mt-1 uml-preview-ref-value">
              Twitter
            </div>
          </motion.div>
        </div>
      </header>

      {/* SOCIAL PROOF, FEATURES, PRICING, RESOURCES, FOOTER */}
      <section className="max-w-7xl mx-auto px-6 py-8 uml-social-proof">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-10 uml-social-list"
        >
          {["Vercel", "Stripe", "Notion", "Slack", "HubSpot"].map((s) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={s}
              className="text-slate-400 text-sm uml-social-item"
              aria-hidden
            >
              {s}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-12 uml-features-section"
      >
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-extrabold text-center uml-features-title"
        >
          Power features for teams
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 grid md:grid-cols-3 gap-6 uml-features-grid"
        >
          {[
            {
              title: "Centralized management",
              desc: "Organize links, tags, and redirects with bulk actions and history.",
              icon: <Settings />,
            },
            {
              title: "Advanced analytics",
              desc: "Traffic sources, campaign reports, drill-downs and exports.",
              icon: <BarChart2 />,
            },
            {
              title: "Security & governance",
              desc: "SSO, RBAC, audit logs and expiration policies for enterprise.",
              icon: <Shield />,
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={cardVariant}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow hover:shadow-lg uml-feature-card"
            >
              <div className="flex items-center gap-4 uml-feature-inner">
                <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white uml-feature-icon">
                  {f.icon}
                </div>
                <div className="uml-feature-text">
                  <div className="font-semibold uml-feature-title">
                    {f.title}
                  </div>
                  <div className="text-sm text-slate-500 mt-1 uml-feature-desc">
                    {f.desc}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section
        id="pricing"
        className="max-w-7xl mx-auto px-6 py-12 bg-gradient-to-b from-white/0 to-transparent uml-pricing-section"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center uml-pricing-header"
        >
          <h3 className="text-3xl font-extrabold uml-pricing-title">
            Simple pricing that scales
          </h3>
          <p className="text-slate-500 mt-2 uml-pricing-sub">
            Free plan for individuals • Pro for teams • Enterprise for
            organizations
          </p>
        </motion.div>

        <div className="mt-6 max-w-xl mx-auto text-center">
          <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold uml-pricing-coming-soon">
            Pricing coming soon — join the waitlist
          </div>
        </div>

        <motion.div
          className="mt-8 grid md:grid-cols-3 gap-6 uml-pricing-grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <PricingCard
            title="Free"
            price="$0"
            features={["500 links / mo", "Basic analytics"]}
            highlight={false}
            comingSoon
          />
          <PricingCard
            title="Pro"
            price="$15"
            features={[
              "5,000 links / mo",
              "Advanced analytics",
              "Custom domains",
            ]}
            highlight={true}
            comingSoon
          />
          <PricingCard
            title="Enterprise"
            price="Contact"
            features={["Unlimited links", "SAML SSO", "Priority support"]}
            highlight={false}
            comingSoon
          />
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 uml-resources-section">
        <div className="grid md:grid-cols-2 gap-8 items-center uml-resources-grid">
          <div className="uml-resources-left">
            <h4 className="text-2xl font-bold uml-resources-title">
              Resources to get you started
            </h4>
            <p className="text-slate-500 mt-2 uml-resources-desc">
              Guides, API docs and integrations to help teams move faster.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 uml-resources-cards">
              <ResourceCard
                title="Getting started"
                desc="Setup guide for custom domains and teams."
              />
              <ResourceCard
                title="API reference"
                desc="Manage links programmatically with our REST API."
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-6 uml-newsletter-card">
            <h4 className="text-xl font-bold uml-newsletter-title">
              Stay in the loop
            </h4>
            <p className="mt-2 text-white/90 uml-newsletter-desc">
              Get product updates and growth tips — 1 email / month.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex gap-2 uml-newsletter-form"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="email"
                placeholder="you@company.com"
                className="flex-1 px-4 py-2 rounded-full text-slate-900 uml-newsletter-input"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-white text-indigo-600 font-semibold uml-newsletter-cta"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <div className="mt-3 text-white/90 uml-newsletter-thanks">
                Thanks — check your inbox.
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 py-8 uml-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6 uml-footer-inner">
          <div className="uml-footer-brand">
            <div className="font-bold uml-footer-name">URLMgr</div>
            <div className="text-sm text-slate-400 mt-2 uml-footer-tagline">
              Manage, brand and measure links with confidence.
            </div>
          </div>

          <div className="flex gap-8 uml-footer-links">
            <div className="uml-footer-col">
              <div className="font-semibold uml-footer-col-title">Product</div>
              <div className="text-sm text-slate-400 mt-2 uml-footer-col-items">
                Features • Pricing • Integrations
              </div>
            </div>
            <div className="uml-footer-col">
              <div className="font-semibold uml-footer-col-title">Company</div>
              <div className="text-sm text-slate-400 mt-2 uml-footer-col-items">
                About • Blog • Careers
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500 mt-6 uml-footer-copyright">
          © {new Date().getFullYear()} URLMgr — Built with ❤️
        </div>
      </footer>
    </div>
  );
}

/* Helper components (JSX) - keep in same file or split out if preferred */

function PricingCard({ title, price, features, highlight, comingSoon }) {
  const baseBg = highlight
    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200";
  return (
    <motion.div
      whileHover={{ scale: comingSoon ? 1 : 1.03 }}
      className={`relative z-0 p-6 rounded-2xl shadow-lg ${baseBg} uml-pricingcard`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 px-3 py-1 rounded-full text-sm font-semibold uml-pricingcard-badge">
          Most popular
        </div>
      )}
      <div className="font-semibold text-lg uml-pricingcard-title">{title}</div>
      <div
        className={`text-3xl font-bold mt-4 ${
          highlight ? "" : "text-slate-900 dark:text-slate-100"
        } uml-pricingcard-price`}
      >
        {price}
        {price !== "Contact" && (
          <span className="text-sm uml-pricingcard-price-suffix">/mo</span>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm opacity-90 uml-pricingcard-features">
        {features.map((f) => (
          <li key={f} className="uml-pricingcard-feature">
            ✔ {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 uml-pricingcard-cta-wrap">
        <button
          disabled
          className={`${
            highlight ? "bg-white text-indigo-600" : "border"
          } px-5 py-2 rounded-full font-semibold uml-pricingcard-cta`}
          aria-disabled="true"
          title={comingSoon ? "Coming soon" : ""}
        >
          {comingSoon ? "Coming soon" : highlight ? "Get Pro" : "Choose"}
        </button>
      </div>
      {comingSoon && (
        <div className="absolute top-3 right-3 text-xs bg-slate-900/10 rounded-full px-2 py-1">
          Coming soon
        </div>
      )}
    </motion.div>
  );
}

function ResourceCard({ title, desc }) {
  return (
    <div className="p-4 rounded-lg bg-white/5 dark:bg-white/5 text-sm uml-resourcecard">
      <div className="font-semibold uml-resourcecard-title">{title}</div>
      <div className="mt-2 text-slate-400 uml-resourcecard-desc">{desc}</div>
      <a
        className="mt-3 inline-block text-indigo-400 font-medium uml-resourcecard-link"
        href="#"
        aria-label={`Read ${title}`}
      >
        Read
      </a>
    </div>
  );
}
