import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FiRefreshCcw,
  FiCommand,
  FiMoon,
  FiLink,
  FiBell,
  FiBarChart2,
  FiDatabase,
  FiTag,
  FiCopy,
  FiZap,
  FiLoader,
} from "react-icons/fi";
import "./CSS/Navbar.css";
import UrlContext from "../context/url_manager/UrlContext";
import ProfileDropdown from "./navbar/ProfileDropdown";
import ProfileCard from "./navbar/ProfileCard";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import VerifyOtp from "./auth/VerifyOtp";
import ThemeDropdown from "./navbar/ThemeDropdown";


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
  } = context;

  const location = useLocation();
  const navigate = useNavigate();
 

  useEffect(() => {
    async function getUser() {
      const fetchedUser = await fetchAndLogUser();
setUserInfoData(fetchedUser);
      // console.log("Fetched user in Navbar:", fetchedUser);
      if (fetchedUser) setUser(fetchedUser); // 👈 Set user here
    }

    getUser();
  }, []);
  const [url, setUrl] = useState("");
  const [openProfileModel, setOpenProfileModel] = useState(false);
  const [openLoginModel, setOpenLoginModel] = useState(false);
  const [openSignupModel, setOpenSignupModel] = useState(false);
  const [openverifyOTPModel, setOpenVerifyOTPModel] = useState(false);
  const [isQuickAddLoading, setIsQuickAddLoading] = useState(false);
     const [isLoggingOut, setIsLoggingOut] = useState(false);
  const totalClicks = filtered.reduce((sum, u) => sum + (u.url_clicks || 0), 0);
  
  const remindersCount = React.useMemo(() => {
    try {
      return (filtered || []).filter((u) => !!u.reminder_at).length;
    } catch {
      return 0;
    }
  }, [filtered]);
  const handleQuickSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isQuickAddLoading) return;

    // Basic validation
    if (!url.trim()) {
      showNotify("error", "Please enter a URL.");
      return;
    }

    setIsQuickAddLoading(true);

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
      setIsQuickAddLoading(false);
      setUrl("");
    }
  };

const handleLogout = async () => {
  if (isLoggingOut) return;
  setIsLoggingOut(true);

  try {
    const result = await logout();
    if (!result.ok) {
      showNotify("error", "Logout failed");
    }
    // console.log("Logout successful:", result);
    showNotify("success", "Logged out successfully!");
  
  } catch (e) {
    // add later
  } finally {
    setIsLoggingOut(false);
  }
};
 const handleThemeChange = () => {
   const root = document.documentElement;
   
  //  root.style.setProperty("--theme-color", "#ef7faff"); // bluish white
  //  root.style.setProperty("--secondary-color", "#8fa8d6"); // soft blue-gray
  document.body.classList.toggle("light-mode");

 };
  return (
    <header className="navbar-pro">
      {/* Login Modal */}
      {openLoginModel && (
        <Login
          isOpen={openLoginModel}
          setOpenSignupModel={setOpenSignupModel}
          isSignUp={openSignupModel}
          onClose={() => setOpenLoginModel(false)}
        />
      )}
      {openSignupModel && (
        <Signup
          isLogin={openLoginModel}
          isSignUp={openSignupModel}
          onClose={() => setOpenSignupModel(false)}
          setOpenLoginModel={setOpenLoginModel}
          setOpenVerifyOTPModel={setOpenVerifyOTPModel}
        />
      )}
      {openverifyOTPModel && (
        <VerifyOtp
          isOpen={openverifyOTPModel}
          onClose={() => setOpenVerifyOTPModel(false)}
          setOpenVerifyOTPModel={setOpenVerifyOTPModel}
        />
      )}

      {/* Top Row */}
      <div className="navbar-top">
        <div className="nav-left">
          <div className="brand">
            <div className="brand-icon">
              <FiLink />
            </div>
            <div className="brand-text">
              <h2>URL Manager Pro</h2>
              <p>
                {filtered.length} URLs • {totalClicks} clicks • {remindersCount}{" "}
                reminders
              </p>
            </div>
          </div>
        </div>

        <div className="nav-right">
          {/* <button className="nav-btn">
            <FiRefreshCcw /> Health Check
          </button> */}
          {/* <button className="nav-btn">
            <FiCommand /> Shortcuts
          </button> */}
          <ThemeDropdown />
          {user !== null ? (
            <>
              <ProfileDropdown
                onLogout={handleLogout}
                user={user}
                isLoggedIn={true}
                onProfile={() => setOpenProfileModel(true)}
              />
              {openProfileModel ? (
                <ProfileCard
                  isOpen={openProfileModel}
                  onClose={() => setOpenProfileModel(false)}
                  user={user}
                />
              ) : null}
            </>
          ) : (
            <ProfileDropdown
              isLoggedIn={false}
              setOpenLoginModel={setOpenLoginModel}
              setOpenSignupModel={setOpenSignupModel}
              setOpenVerifyOTPModel={setOpenVerifyOTPModel}
            />
          )}
        </div>
      </div>

      {/* Quick Add Section */}
      <div className="quick-add">
        <form className="input-wrapper" onSubmit={handleQuickSubmit}>
          <FiLink className="input-icon" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL here for quick add..."
            className="quick-input"
          />
          <button
            type="submit"
            className="quick-btn"
            disabled={isQuickAddLoading || !url.trim()}
          >
            {isQuickAddLoading ? (
              <>
                <FiLoader className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FiZap /> Quick Add
              </>
            )}
          </button>
        </form>
        <p className="tip">
          <span>Tip:</span> Press Enter to add quickly, or use the full form for
          detailed entries
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="nav-tabs">
          <Link
            to="/dashboard"
            className={`tab ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
          >
            <FiLink /> URLs <span className="count">{filtered.length} </span>
          </Link>
          <Link
            to="/reminders"
            className={`tab ${
              location.pathname.startsWith("/reminders") ? "active" : ""
            }`}
          >
            <FiBell /> Reminders <span className="count">{remindersCount}</span>
          </Link>
          <Link
            to="/analytics"
            className={`tab ${
              location.pathname.startsWith("/analytics") ? "active" : ""
            }`}
          >
            <FiBarChart2 /> Analytics
          </Link>
          <Link
            to="/suggestions"
            className={`tab ${
              location.pathname.startsWith("/suggestions") ? "active" : ""
            }`}
          >
            <FiZap /> Suggestions
          </Link>
          <Link
            to="/duplicates"
            className={`tab ${
              location.pathname.startsWith("/duplicates") ? "active" : ""
            }`}
          >
            <FiCopy /> Duplicates
          </Link>
          <Link
            to="/tags"
            className={`tab ${
              location.pathname.startsWith("/tags") ? "active" : ""
            }`}
          >
            <FiTag /> Tags
          </Link>
          <Link
            to="/storage"
            className={`tab ${
              location.pathname.startsWith("/storage") ? "active" : ""
            }`}
          >
            <FiDatabase /> Storage
          </Link>
        </div>
      </div>
    </header>
  );
}
