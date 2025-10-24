// src/UrlmgrLanding.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import './CSS/URLMgrLanding.css'
import {
  ArrowRight,
  Settings,
  Shield,
  BarChart2,
  Copy,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import dashboardPreview from "../assets/dashboard-preview.png";
import dashboardPreviewDark from "../assets/dashboard-preview-dark.png";
import UrlContext from "../context/url_manager/UrlContext";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ThemeDropdown from "./navbar/ThemeDropdown";

/**
 * URLMgr Landing Page (React JSX)
 * - Uses Tailwind utility classes for layout & styling
 * - Uses Framer Motion for animations
 * - Plain JS / JSX (no TypeScript)
 *
 * Replace placeholder images and wire APIs as needed.
 */

export default function URLMgrLanding() {
  const context = React.useContext(UrlContext);
  const {
    addUrl,
    getAllUrls,
    setUrls,
    showNotify,
    filtered,
    archive,
    fetchAndLogUser,
    logout,
    user,
    setUser,
    userInfoData,
    setUserInfoData,
    themeImage,
    setThemeImage,
  } = context;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [managed, setManaged] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isQuickAddLoading, setIsQuickAddLoading] = useState(false);
  const [isManageLoading, setIsManageLoading] = useState(false);
  const [openverifyOTPModel, setOpenVerifyOTPModel] = useState(false);
  const [openLoginModel, setOpenLoginModel] = useState(false);
  const [openSignupModel, setOpenSignupModel] = useState(false);

  const [url, setUrl] = useState("");

  const navigate = useNavigate();
  // set theme from localStorage / system
useEffect(() => {
  if (typeof window === "undefined") return;

  const storedTheme = localStorage.getItem("site-theme");

    setThemeImage(storedTheme);

}, [themeImage]);



  async function handleManage(e) {
    e.preventDefault();

    // Prevent multiple submissions
    if (isManageLoading) return;

    // Basic validation
    if (!url.trim()) {
      showNotify("error", "Please enter a URL.");
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
      id: Date.now().toString(), // Add temporary ID for immediate display
    };

    try {
      // Add to URLs array immediately for real-time update
      setUrls((prevUrls) => [newLink, ...prevUrls]);

      // Then send to API
      let res = await addUrl(newLink);
      navigate(`/dashboard`);
      if (res) {
        showNotify("success", "URL added successfully!");

        // Refresh URLs from server to get the proper ID
        const refreshedUrls = await getAllUrls();
        if (refreshedUrls && refreshedUrls.data) {
          setUrls(refreshedUrls.data);
        }
      }
    } catch (error) {
      // console.error("Error adding URL:", error);
      showNotify("error", "Failed to add URL");
      // Remove the temporary URL if there was an error
      setUrls((prevUrls) => prevUrls.filter((u) => u.id !== newLink.id));
    } finally {
      setIsManageLoading(false);
      setUrls("");
    }
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback
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
    // mock subscribe; replace with backend
    setSubscribed(true);
    setEmail("");
  }

  // motion variants
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


  return (
    <div className={` min-h-screen antialiased uml-root`}>
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
            <a
              href="#integrations"
              className="text-sm hover:text-indigo-400 transition uml-nav-link"
            >
              Integrations
            </a>

            <div className="uml-theme-dropdown"></div>

            <button
              // onClick={() => setOpenSignupModel(true)}
              onClick={() => {
                setOpenLoginModel(true);
              }}
              className="px-4 py-2 text-white rounded-full shadow-lg font-semibold uml-signin-btn"
            >
              Sign In
            </button>

            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-full shadow-lg font-semibold uml-getstarted-btn"
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
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 bg-white/90 dark:bg-slate-900/90 uml-mobile-menu"
            >
              <div className="px-6 py-4 flex flex-col gap-2 uml-mobile-menu-inner">
                <a href="#features" className="py-2 uml-mobile-link">
                  Features
                </a>
                <a href="#pricing" className="py-2 uml-mobile-link">
                  Pricing
                </a>
                <a href="#integrations" className="py-2 uml-mobile-link">
                  Integrations
                </a>
              </div>
            </motion.div>
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
            className="mt-6 text-lg max-w-xl text-slate-400 uml-hero-sub"
          >
            URLMgr centralises link operations: custom domains, campaign
            tracking, governance and team workflows — all in a fast, delightful
            UI.
          </motion.p>

          <motion.form
            initial="hidden"
            animate="show"
            custom={2}
            variants={heroText}
            onSubmit={handleManage}
            className="mt-8 flex gap-3 max-w-xl uml-hero-form"
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
                    >
                      Copy <Copy size={14} />
                    </button>
                    <a
                      className="px-3 py-1 rounded-full border uml-open-btn"
                      href={managed.url}
                      target="_blank"
                      rel="noreferrer"
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
              src="/"
              alt="Dashboard preview"
              className="w-full h-[360px] object-cover uml-preview-image"
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

      {/* SOCIAL PROOF */}
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
            >
              {s}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
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

      {/* PRICING */}
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
          />
          <PricingCard
            title="Enterprise"
            price="Contact"
            features={["Unlimited links", "SAML SSO", "Priority support"]}
            highlight={false}
          />
        </motion.div>
      </section>

      {/* RESOURCES / NEWSLETTER */}
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

      {/* FOOTER */}
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

/* Helper components (JSX) */

function PricingCard({ title, price, features, highlight }) {
  // adjusted dark background to avoid "too dark" panels
  const baseBg = highlight
    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200";
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
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
          className={`${
            highlight ? "bg-white text-indigo-600" : "border"
          } px-5 py-2 rounded-full font-semibold uml-pricingcard-cta`}
        >
          {highlight ? "Get Pro" : "Choose"}
        </button>
      </div>
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
      >
        Read
      </a>
    </div>
  );
}
