import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiBell,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/ProfileDropdown.css";

// Example: Replace this with your actual AuthContext import
// import { AuthContext } from "../context/AuthContext";

/**
 * ProfileDropdown.jsx
 * -------------------
 * Now supports `isLoggedIn` to toggle between
 * user actions (Profile/Settings/Logout)
 * and guest actions (Login/Sign Up).
 */

export default function ProfileDropdown({
  user = { name: "Guest", email: "", avatarUrl: "" },
  onProfile = () => {},
  onSettings = () => {},
  onNotifications = () => {},
  onLogout = () => {},
  setOpenLoginModel = () => {},
  setOpenSignupModel = () => {},
  openSignupModel,
  onSignup = () => {},
  collapsed = true,
  openSettings,
  setSettingsOpen,
  mobileOpen,
  setWebNotifications,
  closeMobile = () => {},
  isLoggedIn = () => false, // 👈 Pass this directly or from context
}) {
  // const { isLoggedIn } = useContext(AuthContext); // optional if using context

  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // manage focus when opened
  useEffect(() => {
    if (open) {
      const firstBtn = menuRef.current?.querySelector("button");
      firstBtn?.focus();
    }
  }, [open]);

  // keyboard navigation inside menu
  useEffect(() => {
    function navKeys(e) {
      if (!open) return;
      const focusable = menuRef.current?.querySelectorAll(
        "button:not([disabled])"
      );
      if (!focusable || focusable.length === 0) return;
      const arr = Array.from(focusable);
      const idx = arr.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = arr[(idx + 1) % arr.length];
        next.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = arr[(idx - 1 + arr.length) % arr.length];
        prev.focus();
      }
    }
    window.addEventListener("keydown", navKeys);
    return () => window.removeEventListener("keydown", navKeys);
  }, [open]);

  const avatar = user.avatarUrl || "";
  // inside the component, add these near other hooks/refs:
  const [showDetails, setShowDetails] = useState(!collapsed); // initially visible when not collapsed
  const expandDelayMs = 100; // match this with your sidebar CSS transition duration

  useEffect(() => {
    let t;
    if (!collapsed) {
      // Sidebar is expanding -> delay showing name/chevron until expand is done
      t = setTimeout(() => setShowDetails(true), expandDelayMs);
    } else {
      // Sidebar is collapsed -> hide details immediately
      setShowDetails(false);
    }
    return () => clearTimeout(t);
  }, [collapsed]);

  return (
    <div className="relative inline-block text-left pd-root">
      <button
        ref={btnRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-3 rounded-full px-1.5 py-1.5 bg-white/6 backdrop-blur-sm hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 pd-toggle-btn"
      >
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 pd-avatar">
          {avatar && isLoggedIn ? (
            <img
              src={avatar}
              alt="avatar"
              className="h-full w-full object-cover pd-avatar-img"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-700 font-medium pd-avatar-fallback">
              {isLoggedIn ? (
                (user.name || "U")[0]
              ) : (
                <FiUser className="pd-avatar-icon" />
              )}
            </div>
          )}
        </div>

        {/* Render name + chevron only after the expansion delay */}
        {showDetails && (
          <>
            <span className="pd-name-wrap text-sm font-medium text-white">
              {isLoggedIn ? user.name : "Guest"}
            </span>

            <FiChevronDown
              className={`ml-1 text-gray-300 ${
                open ? "rotate-180" : ""
              } transition-transform pd-chevron`}
            />
          </>
        )}
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.14 }}
            ref={menuRef}
            className="proflie-module origin-bottom-left border border-gray-600 absolute left-10 bottom-12 mt-2 w-56 rounded-lg backdrop-blur-md shadow-lg ring-1 ring-black/30 focus:outline-none z-50 pd-menu"
            role="menu"
            aria-orientation="vertical"
            aria-label="Profile options"
          >
            {isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="px-3 py-3 border-b border-white/6 pd-user-info">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 pd-avatar-sm">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="avatar"
                          className="h-full w-full object-cover pd-avatar-sm-img"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-700 font-medium pd-avatar-sm-fallback">
                          {(user.name || "U")[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pd-user-meta">
                      <p className="text-sm font-semibold text-white truncate pd-user-name">
                        {user.name || "User"}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-300 truncate pd-user-email">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logged-in menu */}
                <div className="py-2 px-2 flex flex-col gap-1 pd-loggedin-menu">
                  <button
                    onClick={() => {
                      setOpen(false);
                      onProfile();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-profile-btn"
                  >
                    <FiUser className="pd-icon" />
                    <span className="pd-menu-item-label">Profile</span>
                  </button>

                  {/* <button
                    onClick={() => {
                      setOpen(false);
                      onSettings();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-settings-btn"
                  >
                    <FiSettings className="pd-icon" />
                    <span className="pd-menu-item-label">Settings</span>
                  </button> */}

                  <button
                    onClick={() => {
                      setOpen(false);
                      // onNotifications();
                      setWebNotifications(true)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-notifications-btn"
                  >
                    <FiBell className="pd-icon" />
                    <span className="pd-menu-item-label">Notifications</span>
                  </button>
                  <div
                    className="profile-settings w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-settings-btn"
                    onClick={() => {
                      setSettingsOpen(!openSettings);
                      if (mobileOpen) closeMobile();
                    }}
                    title="Settings"
                  >
                    <button>
                      <FiSettings />
                    </button>

                    <span className="pd-menu-item-label">Settings</span>
                  </div>
                  <div className="h-px bg-white/6 my-1 rounded pd-divider" />

                  <button
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-600/10 focus:bg-red-600/10 focus:outline-none pd-menu-item pd-logout-btn"
                  >
                    <FiLogOut className="pd-icon" />
                    <span className="pd-menu-item-label">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Guest Menu */}
                <div className="py-2 px-2 flex flex-col gap-1 pd-guest-menu">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setOpenLoginModel(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-login-btn"
                  >
                    <FiLogIn className="pd-icon" />
                    <span className="pd-menu-item-label">Login</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      setOpenSignupModel(true);
                      // console.log(openSignupModel);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-signup-btn"
                  >
                    <FiUserPlus className="pd-icon" />
                    <span className="pd-menu-item-label">Sign Up</span>
                  </button>
                  <div
                    className="more-settings w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-white/10 focus:bg-white/6 focus:outline-none pd-menu-item pd-signup-btn"
                    onClick={() => {
                      setSettingsOpen(!openSettings);
                      if (mobileOpen) {
                        closeMobile();
                      }
                    }}
                    title="Settings"
                  >
                    <button>
                      <FiSettings />
                    </button>

                    <span className="settings-label text-xs sm:text-">
                      Settings
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
