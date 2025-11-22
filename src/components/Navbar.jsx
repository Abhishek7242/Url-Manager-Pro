// Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FiLink,
  FiBell,
  FiBarChart2,
  FiDatabase,
  FiTag,
  FiCopy,
  FiZap,
  FiLoader,
  FiChevronsLeft,
  FiChevronsRight,
  FiCommand,
  FiSettings,
} from "react-icons/fi";
import {
  Link2,
  Bell,
  BarChart3,
  Lightbulb,
  Copy,
  Tag,
  Database,
  Command,
  ChevronLeft,
  ChevronRight,
  Zap,
  Loader2,
  Users,
} from "lucide-react";

import "./CSS/Navbar.css";
import "./CSS/Navbar.css"; // new responsive CSS (load after base styles)
import UrlContext from "../context/url_manager/UrlContext";
import ProfileDropdown from "./navbar/ProfileDropdown";
import ProfileCard from "./navbar/ProfileCard";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import VerifyOtp from "./auth/VerifyOtp";
import ThemeDropdown from "./navbar/ThemeDropdown";
import { span } from "framer-motion/client";

export default function Navbar() {
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
    openLoginModel,
    setOpenLoginModel,
    openSignupModel,
    setOpenSignupModel,
    openverifyOTPModel,
    setOpenVerifyOTPModel,
    updateRootBackground,
    openProfileModel,
    setOpenProfileModel,
    openSettings,
    setSettingsOpen,
    webNotifications,
    setWebNotifications,
    friendsModalOpen,
    setFriendsModalOpen,
  } = context;

  const location = useLocation();

  useEffect(() => {
    let background =
      localStorage.getItem("appBackground") ||
      "linear-gradient(135deg, #0f0c29, #302b63, #24243e)";
    updateRootBackground(background);

    // async function getUser() {
    //   const fetchedUser = await fetchAndLogUser();
    //   setUserInfoData(fetchedUser);
    //   if (fetchedUser) setUser(fetchedUser);
    // }
    // getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [animating, setAnimating] = useState(false);

  // NEW: mobile open state (controls slide-in on small screens)
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalClicks = (filtered || []).reduce(
    (sum, u) => sum + (u.url_clicks || 0),
    0
  );

  const remindersCount = React.useMemo(() => {
    try {
      return (filtered || []).filter((u) => !!u.reminder_at).length;
    } catch {
      return 0;
    }
  }, [filtered]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const result = await logout();
      console.log("Logout successful:", result);

      if (!result.success == true) {
        showNotify("error", "Logout failed");
      } else {
        showNotify("success", "Logged out successfully!");
      }
    } catch (e) {
      // noop
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleCollapse = () => {
    if (animating) return;
    setAnimating(true);

    if (collapsed) {
      // EXPANDING
      setCollapsed(false);

      // Delay content reflow (showing labels) until width transition finishes
      setTimeout(() => {
        setAnimating(false);
        document.querySelector(".navbar-pro")?.classList.add("expanded-ready");
      }, 300); // match your CSS transition time
    } else {
      // COLLAPSING
      document.querySelector(".navbar-pro")?.classList.remove("expanded-ready");
      setCollapsed(true);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  // NEW: toggle mobile drawer
  const toggleMobile = () => {
    setMobileOpen((s) => !s);
    // keep desktop collapsed state in sync on open for consistent look
    if (!mobileOpen) {
      // when opening mobile drawer, ensure it's not visually collapsed content-wise
      // but do not change your collapse logic — only visual helper here
      // (no state change to `collapsed` so your original logic remains unchanged)
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const links = [
    {
      to: "/dashboard",
      icon: <Link2 color="#b0b8ff" />,
      label: "URLs",
      meta: `${(filtered || []).length}`,
    },
    { to: "/tags", icon: <Tag color="#fb923c" />, label: "Tags" },
    {
      to: "/analytics",
      icon: <BarChart3 color="#5ad2ff" />,
      label: "Analytics",
    },
    {
      to: "/suggestions",
      icon: <Lightbulb color="#facc15" />,
      label: "Suggestions",
    },
    { to: "/duplicates", icon: <Copy color="#fbbf24" />, label: "Duplicates" },
    // {
    //   to: "/friends",
    //   icon: <Users color="#fffdd0" />, // blue tone for friends
    //   label: "Friends",
    //   // meta: `${friendsCount}`,
    // },

    { to: "/storage", icon: <Database color="#a78bfa" />, label: "Storage" },
  ];

  return (
    <>
      {/* Mobile toggle (visible below 1000px via CSS) */}
      <button
        className={`mobile-toggle mobile-toggle-btn ${
          mobileOpen ? "open" : "hide"
        }`}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        onClick={toggleMobile}
      >
        {/* Not a classic hamburger — arrow-like icon using chevrons */}
        {mobileOpen ? <FiChevronsLeft /> : <FiChevronsRight />}
      </button>

      {/* backdrop for mobile when drawer open */}
      <div
        className={`mobile-backdrop ${mobileOpen ? "visible" : ""}`}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      {/* main sidebar — gets .open on mobile when mobileOpen true */}
      <aside
        className={`navbar-pro ${collapsed ? "collapsed" : ""} ${
          animating ? "animating" : ""
        } ${mobileOpen ? "mobile open" : ""}`}
        aria-hidden={false}
      >
        {/* Top area */}
        <div className="sidebar-top">
          <div onClick={toggleCollapse} className="brand-name compact">
            <div className="brand-icon" aria-hidden>
              <FiCommand />
            </div>
            {!collapsed && (
              <div className="brand-text" aria-hidden={collapsed}>
                <h2>URL Manager</h2>
                <span className="text-xs align-super">(BETA)</span>
              </div>
            )}
          </div>

          {/* Collapse toggle - positioned on right to match image */}
          <button
            className="collapse-btn"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {/* rotate icon using CSS */}
            {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
        </div>

        {/* Links list */}
        <nav className="nav-tabs-vertical" aria-label="Main navigation">
          {links.map((l) => {
            const active =
              location.pathname === l.to ||
              location.pathname.startsWith(`${l.to}/`);

            return (
              <Link
                key={l.to}
                to={l.to}
                className={`tab-vertical ${active ? "active" : ""}`}
                title={l.label}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  // Close mobile drawer when navigating on small screens
                  if (mobileOpen) closeMobile();
                }}
              >
                <div className="tab-icon">{l.icon}</div>
                {!collapsed && (
                  <>
                    <div className="tab-label">{l.label}</div>
                    {l.meta && <div className="tab-meta">{l.meta}</div>}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom area: theme & profile */}
        <div className="sidebar-bottom flex-col">
          {/* {!collapsed && <ThemeDropdown />} */}
          {/* <div
            className="nav-settings flex items-center rounded-full justify-center gap-3"
            onClick={() => {
              setSettingsOpen(!openSettings);
              if (mobileOpen) closeMobile();
            }}
            title="Settings"
          >
            <button>
              <FiSettings />
            </button>
            {!collapsed && (
              <span className="settings-label text-xs sm:text-">Settings</span>
            )}
          </div> */}
          {user !== null ? (
            <ProfileDropdown
              setWebNotifications={setWebNotifications}
              onLogout={handleLogout}
              user={user}
              isLoggedIn={true}
              onProfile={() => setOpenProfileModel(true)}
              collapsed={collapsed}
              openSettings={openSettings}
              setSettingsOpen={setSettingsOpen}
              mobileOpen={mobileOpen}
              closeMobile={closeMobile}
              friendsModalOpen={friendsModalOpen}
              setFriendsModalOpen={setFriendsModalOpen}
              setMobileOpen={setMobileOpen}
            />
          ) : (
            <ProfileDropdown
              setWebNotifications={setWebNotifications}
              isLoggedIn={false}
              setOpenLoginModel={setOpenLoginModel}
              setOpenSignupModel={setOpenSignupModel}
              setOpenVerifyOTPModel={setOpenVerifyOTPModel}
              collapsed={collapsed}
              openSettings={openSettings}
              setSettingsOpen={setSettingsOpen}
              closeMobile={closeMobile}
              mobileOpen={mobileOpen}
              friendsModalOpen={friendsModalOpen}
              setFriendsModalOpen={setFriendsModalOpen}
              setMobileOpen={setMobileOpen}
            />
          )}
        </div>
      </aside>
    </>
  );
}
