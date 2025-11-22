import { useMemo, useState, useEffect, useCallback } from "react";
import AuthLimitModal from "../../components/AuthLimitModal.jsx";
import UrlContext from "./UrlContext";
import AuthFeatureModal from "../../components/AuthFeatureModal.jsx";
import { useNavigate } from "react-router-dom";
import TooltipRemove from "../../components/dashboard/TooltipRemove.jsx";
const UrlState = (props) => {
  // http://localhost:8000/
  // const API_BASE = "http://localhost:8000/api"; // Laravel backend
  // const BASE = "http://localhost:8000"; // Laravel backend

  const API_BASE = import.meta.env.VITE_API_BASE;
  const BASE = import.meta.env.VITE_BASE;

  const canonicalUrl = "https://www.urlmg.com/";

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    url: "",
    description: "",
    tags: "",
    status: "active",
  });
  const [urls, setUrls] = useState([]);
  const [userInfoData, setUserInfoData] = useState([]);
  const [themeImage, setThemeImage] = useState("");

  const [archive, setArchive] = useState(false);
  const [notify, setNotify] = useState(null);
  const [search, setSearch] = useState("");
  const [showAuthLimit, setShowAuthLimit] = useState(false);
  const [showAuthFeature, setShowAuthFeature] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeSort, setActiveSort] = useState("date");
  const [screenLoading, setScreenLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp_token, setOtpToken] = useState("");
  const [openLoginModel, setOpenLoginModel] = useState(false);
  const [openSignupModel, setOpenSignupModel] = useState(false);
  const [openverifyOTPModel, setOpenVerifyOTPModel] = useState(false);
  const [statsView, setStatsView] = useState("");
  const [tagsView, setTagsView] = useState("");
  const [urlsView, setUrlsView] = useState("");
  const [openProfileModel, setOpenProfileModel] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showDetails, setShowDetails] = useState([]);
  const [openSettings, setSettingsOpen] = useState(false);
  const [webNotifications, setWebNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [termsData, setTermsData] = useState([]);
  const [privacyData, setPrivacyData] = useState([]);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [termsAndConditionsModalOpen, setTermsAndConditionsModalOpen] =
    useState(false);
  const navigate = useNavigate();
  async function submitIndexNow() {
    const res = await fetch(`${API_BASE}/indexnow/submit-sitemap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sitemapUrl: `${BASE}/sitemap.xml`,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "IndexNow submission failed");
    }
    return data.result; // includes status/body from IndexNow
  }
  const updateRootBackground = (bg) => {
    const root = document.querySelector("#root");
    if (!root) return;

    root.style.setProperty(
      "--bg-image",
      bg.startsWith("http") ? `url(${bg})` : bg
    );
  };
  async function fetchTerms() {
    try {
      const res = await fetch(`${API_BASE}/terms/list`, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch terms");
      }
      setTermsData(json.data);
      // Normalize structure
      return json.data;
    } catch (error) {
      return [];
    }
  }
  async function fetchPrivacyData() {
    try {
      const res = await fetch(`${API_BASE}/privacy/list`, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch terms");
      }
      setTermsData(json.data);
      // Normalize structure
      return json.data;
    } catch (error) {
      return [];
    }
  }

  const [user, setUser] = useState(null);

  // ext-notify.js - run this after successful signup/login (session cookie already set)
  // Example usage in React: call notifyExtensionOnAuth(user) inside your OTP success handler if ext_redirect query present.

  // ext-notify.js
  async function notifyExtensionOnAuth(user) {
    try {
      if (!user || typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      if (!params.get("ext_redirect")) return; // only if opened from extension

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      };

      window.postMessage(
        {
          type: "EXT_AUTH_SUCCESS",
          user: safeUser,
        },
        window.location.origin
      );

      // Optional: clean URL so ext_redirect doesn't stay forever
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("ext_redirect");
        window.history.replaceState({}, document.title, url.toString());
      } catch {}
    } catch (e) {
      console.warn("notifyExtensionOnAuth failed", e);
    }
  }

  async function fetchAndLogUser() {
    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });
      const bodyText = await res.text();
      if (!res.ok) {
        setUser(null);
        return null;
      }
      setIsLoggedIn(true);
      let data = JSON.parse(bodyText);
      // notifyExtensionOnAuth(data);
      setUser(data);
      // console.log(res.status, data);
      return data;
    } catch (err) {
      // console.log("gestuser");
    }
  }
  async function getTags() {
    try {
      const res = await fetch(`${API_BASE}/user/tags`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include", // if using Sanctum cookies; remove if using Bearer tokens
      });

      if (!res.ok) throw new Error("Failed to fetch tags");

      const data = await res.json();
      // console.log(data.data);
      if (data.success) {
        setUserTags(data.data); // ✅ update React state here
      }

      return data.data || [];
    } catch (err) {
      console.error("Error loading tags:", err);
      return [];
    }
  }
  async function addTag(icon, tag) {
    try {
      const res = await fetch(`${API_BASE}/user/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
        body: JSON.stringify({ icon, tag }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || `Request failed (${res.status})`,
        };
      }

      // Expect { success: true, tag: {id, tag} } or { success: true, data: [...] }
      if (data?.tag) return { success: true, tag: data.tag };
      if (Array.isArray(data?.data)) {
        const last = data.data[data.data.length - 1];
        return { success: true, tag: last };
      }
      // fallback
      return { success: true, tag: data?.data ?? null };
    } catch (err) {
      return { success: false, message: err?.message || "Network error" };
    }
  }

  const updateTag = async (id, icon, tag) => {
    try {
      // mirror your URL builder pattern (falls back between guest/user endpoints if you use that)
      const url = await buildGetUrlsUrl(
        `${API_BASE}/guest/tags/${id}`,
        `${API_BASE}/user/tags/${id}`
      );

      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
        body: JSON.stringify({ icon, tag }),
      });

      if (!res.ok) {
        // try to get a helpful error message from backend
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (e) {
          // ignore parse error
        }
        throw new Error(
          errorData.message || `Failed to update tag (status ${res.status})`
        );
      }

      const result = await res.json();
      return result;
    } catch (err) {
      // keep same behavior as your other functions (silently swallow or log)
      // console.error("❌ Error updating tag:", err);
      // throw err; // uncomment if you want the caller to catch
    }
  };
  async function deleteTag(id) {
    try {
      // Build correct endpoint for guest or logged-in user
      const url = await buildGetUrlsUrl(
        `${API_BASE}/guest/tags/delete/${id}`,
        `${API_BASE}/user/tags/${id}` // Laravel route: DELETE /api/user/tags/{id}
      );

      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include", // required for Sanctum cookie auth
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || "Failed to delete tag");
      }

      const data = await res.json();
      return data; // { success: true, message: "Tag deleted.", id: ... }
    } catch (err) {
      console.error("❌ deleteTag error:", err);
      return { success: false, message: err.message };
    }
  }

  // src/api/getNotifications.js
  async function getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include", // optional if you use auth cookies
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications); // ✅ set the data here
      }
      return data.notifications || [];
    } catch (err) {
      console.error("Error loading notifications:", err);
      return [];
    }
  }

  useEffect(() => {
    // getNotifications();
    // fetchAndLogUser();
    sendUserSession();
    // submit IndexNow();
    // submitIndexNow()
    ensureSession(); // synchronous: writes "lynkr_session" immediately
  }, []);

  const showNotify = (type, message) => {
    setNotify({ type, message });
  };
  // const getApiOrigin = () => API_BASE.replace(/\/api$/, "");

  // const ensureCsrfCookie = async () => {
  //   try {
  //     let res = await fetch(`${getApiOrigin()}/sanctum/csrf-cookie`, {
  //       credentials: "include",
  //     });
  //     // console.log(res);
  //   } catch (e) {
  //     console.error("Failed to get CSRF cookie", e);
  //     throw e;
  //   }
  // };

  const getXsrfHeader = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    return token ? { "X-XSRF-TOKEN": token } : {};
  };

  // Ensure a local session exists. Stores a session object in localStorage under 'lynkr_session'.
  const ensureSession = () => {
    try {
      const STORAGE_KEY = "lynkr_session";
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id) return parsed;
        } catch {
          // malformed JSON, continue to recreate
        }
      }

      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

      const session = { id, createdAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (err) {
      // console.error("ensureSession error", err);
      return null;
    }
  };
  // src/api/sendSession.js
  async function sendUserSession() {
    try {
      // Get Laravel session ID from localStorage
      const sessionId = await ensureSession();
      // // console.log(sessionId.id);
      const sessionData = {
        user_id: localStorage.getItem("UserID") || null,
        ip_address: await getUserIP(),
        user_agent: navigator.userAgent,
        payload: "User active on site",
        last_activity: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE}/user/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId.id, // 🔥 Custom header to send Laravel session id
        },
        body: JSON.stringify(sessionData),
        credentials: "include",
      });

      const result = await response.json();
      // console.log("Session response:", result);
      return result;
    } catch (error) {
      // console.error("Error sending user session:", error);
    }
  }

  async function getUserIP() {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch {
      return "Unknown";
    }
  }
  const handleToggleFavourite = async (id) => {
    console.log(id);
    if (!id) return;

    try {
      // 🔹 1. Find current link
      const urlItem = urls.find((u) => String(u.id) === String(id));
      if (!urlItem) return;

      const isCurrentlyFav = Array.isArray(urlItem.tags)
        ? urlItem.tags.includes("#favourite")
        : false;

      console.log("isCurrentlyFav:", isCurrentlyFav);

      // 🔹 2. Send API request to backend (send new state)
      const response = await fetch(`${API_BASE}/update-favourite`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
        body: JSON.stringify({
          id: id,
          favourite: !isCurrentlyFav, // send desired new state
        }),
      });

      if (!response.ok) throw new Error("Failed to update favourite");
      const data = await response.json();

      // 🔹 3. Update state only after success
      if (setUrls) {
        setUrls((prev) =>
          prev.map((x) => {
            if (String(x.id) !== String(id)) return x;

            const currentTags = Array.isArray(x.tags) ? [...x.tags] : [];
            const newTags = isCurrentlyFav
              ? currentTags.filter((t) => t !== "#favourite")
              : [...currentTags, "#favourite"];

            return { ...x, tags: newTags };
          })
        );
      }

      // 🔹 4. Notify success
      if (showNotify) {
        showNotify(
          "success",
          data?.message ||
            (!isCurrentlyFav
              ? "Marked as favourite"
              : "Removed from favourites")
        );
      }
    } catch (err) {
      console.error("Favourite update failed:", err);
      if (showNotify) showNotify("error", "Failed to update favourite");
    }
  };

  // create/ensure session once on provider mount

  async function buildGetUrlsUrl(sessionUrl, userUrl) {
    let url;
    const session = ensureSession();
    // console.log(user);
    // First check if we need to fetch user data
    if (user === null) {
      try {
        const userData = await fetchAndLogUser();
        // console.log(userData);
        // If still null after fetch, use session URL
        if (!userData) {
          url = new URL(`${sessionUrl}`);
          url.searchParams.set("session_id", session.id);
          return url;
        }
      } catch (error) {
        // console.error("Error fetching user:", error);
        // If error in fetching user, fallback to session URL
        url = new URL(`${sessionUrl}`);
        url.searchParams.set("session_id", session.id);
        return url;
      }
    }

    // If we have user data (either previously or just fetched), use user URL
    url = new URL(`${userUrl}`);
    return url;
  }
  async function fetchBackgrounds() {
    try {
      const response = await fetch(`${API_BASE}/backgrounds`);
      if (!response.ok) throw new Error("Failed to fetch backgrounds");
      const data = await response.json();
      return data; // returns { live: [...], image: [...], gradient: [...], solid: [...] }
    } catch (error) {
      console.error("Error fetching backgrounds:", error);
      return { live: [], image: [], gradient: [], solid: [] }; // fallback
    }
  }
  // ✅ Add new URL (POST)
  const addUrl = async (data) => {
    console.log(data);
    try {
      let url = await buildGetUrlsUrl(
        `${API_BASE}/url/add`,
        `${API_BASE}/url/create`
      );

      // console.log(url);
      const isLoggedIn = Boolean(user);
      if (!isLoggedIn) {
        // Get the full response first
        const urlsResponse = await getAllUrls();
        // Then check the data array length
        const currentUrlCount = urlsResponse?.data?.length || 0;

        // console.log("Current URL count:", currentUrlCount);

        if (currentUrlCount >= 5) {
          setShowAuthLimit(true);
          throw new Error(
            `URL limit reached (${currentUrlCount}/5). Please log in to add more URLs.`
          );
        }
      }

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
        body: JSON.stringify({ ...data }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        showNotify("error", errorData.message || "Failed to add URL");
        throw new Error(errorData.message || "Failed to add URL");
      }

      const result = await res.json();
      // console.log("aDDDDDDDDED", result);
      return result;
    } catch (err) {}
  };

  // ✅ Update URL (PUT)
  const updateUrl = async (id, data) => {
    try {
      let url = await buildGetUrlsUrl(
        `${API_BASE}/guest/url/edit/${id}`,
        `${API_BASE}/user/url/edit/${id}`
      );

      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
        body: JSON.stringify({ ...data }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update URL");
      }

      const result = await res.json();
      return result;
    } catch (err) {
      // console.error("❌ Error updating URL:", err);
      // throw err;
    }
  };
  function getCsrfToken() {
    // console.log("All cookies:", document.cookie);
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "XSRF-TOKEN") {
        const decoded = decodeURIComponent(value);
        // console.log("Found XSRF-TOKEN:", decoded.substring(0, 20) + "...");
        return decoded;
      }
    }
    // console.log("XSRF-TOKEN not found in cookies");
    return null;
  }
  // Helper function to make authenticated requests
  async function makeAuthenticatedRequest(url, options = {}) {
    // Step 1: Get CSRF cookie first
    await fetch(`${BASE}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });

    // Small delay to ensure cookies are set
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Step 2: Get CSRF token from cookie
    const csrfToken = getCsrfToken();

    // Step 3: Make the request with proper headers
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
    };

    // Add CSRF token if available
    if (csrfToken) {
      defaultOptions.headers["X-XSRF-TOKEN"] = csrfToken;
    } else {
      // console.warn("No CSRF token found in cookies");
    }

    // Merge options properly to avoid overriding credentials
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    return fetch(url, mergedOptions);
  }

  // updateUserName.js
  async function updateUserName(updated) {
    try {
      // Determine which field we’re updating
      const hasName = Object.prototype.hasOwnProperty.call(updated, "name");
      const hasEmail = Object.prototype.hasOwnProperty.call(updated, "email");

      let endpoint = `${API_BASE}/user/update-profile`; // default fallback
      let body = {};

      if (hasName) {
        endpoint = `${API_BASE}/user/update-name`;
        body = { name: updated.name };
      } else if (hasEmail) {
        endpoint = `${API_BASE}/user/update-email`;
        body = { email: updated.email };
      } else {
        throw new Error("Invalid update type. Must include name or email.");
      }

      // 🔹 Make the request
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }
      let user = await fetchAndLogUser();

      console.log("✅ User updated successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating user:", error.message);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      // console.log("Starting logout process...");

      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/logout`,
        {
          method: "POST",
        }
      );

      // console.log("Logout response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(null);

      // console.log("Logout successful:", data);

      // // Clear any local storage and state
      // localStorage.removeItem("user");
      // localStorage.removeItem("session_id");

      // Clear user state

      // Clear current URLs and fetch fresh ones
      setUrls([]);
      setUserTags([]);
      const refreshedUrls = await getAllUrls();
      if (refreshedUrls && refreshedUrls.data) {
        setUrls(refreshedUrls.data);
      }
      localStorage.removeItem("lynkr_tabs_view");

      navigate("/");
      return data;
    } catch (error) {
      // console.error("Logout failed:", error);
      // throw error;
    }
  }
  // Prefer a stored personal access token for Authorization. HttpOnly cookies are unreadable in JS.

  // ✅ Get all URLs (GET)
  const getAllUrls = async () => {
    try {
      let url = await buildGetUrlsUrl(
        `${API_BASE}/geturls`,
        `${API_BASE}/get-urls`
      );

      // console.log(`🔍 Fetching URLs from: ${url.toString()}`);

      const headers = {
        Accept: "application/json",
        // don't set Content-Type for GET requests

        ...getXsrfHeader(), // expected to return an object like { 'X-XSRF-TOKEN': '...' } or {}
      };

      const res = await fetch(url.toString(), {
        method: "GET",
        headers,
        credentials: "include", // required for cookie/session auth
      });

      // console.log(`📡 Response status: ${res.status} ${res.statusText}`);
      // Note: res.headers is a Headers object; to inspect specific header:
      // console.log("📡 Response content-type:", res.headers.get("content-type"));

      // If server returned non-JSON, capture and log text for debugging
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const textResponse = await res.text();
        // console.error("❌ Server returned non-JSON response:", textResponse);
        throw new Error(
          `Expected JSON but got ${
            contentType || "unknown"
          }. Response: ${textResponse.substring(0, 1000)}`
        );
      }

      // If response status not 2xx, parse JSON if possible and throw meaningful error
      const parsed = await res.json();

      if (!res.ok) {
        // console.error("❌ API error payload:", parsed);
        const serverMessage =
          parsed?.message ||
          parsed?.error ||
          `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(serverMessage);
      }

      // console.log("✅ Successfully fetched URLs:", parsed);
      return parsed; // or return parsed.data if your API wraps the payload in `data`
    } catch (err) {
      // Network errors or thrown errors end up here
      // console.error("❌ Error fetching URLs:", err);
      // throw err;
    }
  };

  // ✅ Get single URL by ID (GET)
  const getUrlById = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/urls/${id}`, {
        headers: {
          ...getXsrfHeader(),
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch URL");
      return await res.json();
    } catch (err) {
      // console.error("❌ Error fetching URL:", err);
      // throw err;
    }
  };

  // src/api/urlService.js

  async function deleteUrlPost(id) {
    // options: { withCredentials: true } if using cookies/Sanctum
    try {
      let url = await buildGetUrlsUrl(
        `${API_BASE}/guest/url/delete/${id}`,
        `${API_BASE}/user/url/delete/${id}`
      );
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getXsrfHeader(),
        },
        // body: JSON.stringify({}) // optional; not required for delete-by-id
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || "Failed to delete");
      }

      return await res.json(); // { success: true, message: 'URL deleted successfully', id: ... }
    } catch (err) {
      // console.error("deleteUrlPost error", err);
      // throw err;
    }
  }
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const d = activeSort.trim().toLowerCase();

    // Ensure urls is always an array
    const urlsArray = Array.isArray(urls) ? urls : [];

    // 1) Always apply archive logic first
    const base = archive
      ? urlsArray.filter((l) => l.status === "archived")
      : urlsArray.filter((l) => l.status === "active");

    // 2) Then apply search (if present) on the base set
    let result;
    if (!q) {
      result = base;
    } else {
      result = base.filter((l) =>
        [l.title, l.url, l.note, ...(l.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // 3) Sorting logic (date/title/clicks)
    if (d === "date" || d === "date added" || d === "newest") {
      result = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (d === "oldest") {
      result = result.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (d === "title") {
      result = result.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        })
      );
    } else if (d === "clicks" || d === "count") {
      result = result.sort((a, b) => (b.url_clicks || 0) - (a.url_clicks || 0));
    }

    return result;
  }, [urls, search, archive, activeSort]);

  const updateClickCount = async (id) => {
    try {
      let url = await buildGetUrlsUrl(
        `${API_BASE}/guest/url/update-click-count/${id}`,
        `${API_BASE}/user/url/update-click-count/${id}`
      );
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update click count");
      // console.log("✅ Successfully updated click count for ID:", id);
      setUrls((prevUrls) =>
        prevUrls.map((url) =>
          url.id === id ? { ...url, url_clicks: url.url_clicks + 1 } : url
        )
      );
      return await res.json();
    } catch (err) {
      // console.error("❌ Error updating click count:", err);
      // throw err;
    }
  };

  const onKeep = async (id) => {
    try {
      let url = await buildGetUrlsUrl(
        `${API_BASE}/url/keep/${id}`,
        `${API_BASE}/url/keep-this/${id}`
      );

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to keep URL");
      return await res.json();
    } catch (err) {
      // console.error("❌ Error keeping URL:", err);
      // throw err;
    }
  };

  const batchUpdateUrlStatus = async (urlIds, status = "archived") => {
    try {
      // Keep track of successful and failed updates
      const results = {
        successful: [],
        failed: [],
        total: urlIds.length,
      };

      // Process each URL ID sequentially
      for (const id of urlIds) {
        try {
          let url = await buildGetUrlsUrl(
            `${API_BASE}/guest/url/edit/${id}`,
            `${API_BASE}/user/url/edit/${id}`
          );

          const res = await fetch(url.toString(), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...getXsrfHeader(),
            },
            credentials: "include",
            body: JSON.stringify({ status }),
          });

          if (!res.ok) {
            results.failed.push(id);
            // console.error(`Failed to update URL ${id}:`, res.statusText);
            continue;
          }

          // Update was successful
          results.successful.push(id);

          // Update local state for this URL
          setUrls((prevUrls) =>
            prevUrls.map((url) => (url.id === id ? { ...url, status } : url))
          );
        } catch (err) {
          results.failed.push(id);
          // console.error(`Error updating URL ${id}:`, err);
        }
      }

      // Show summary notification
      const message = `Updated ${results.successful.length}/${results.total} URLs to ${status}`;
      showNotify(results.failed.length === 0 ? "success" : "warning", message);

      // Fetch fresh data to ensure UI is in sync
      const refreshedData = await getAllUrls();
      if (refreshedData && refreshedData.data) {
        setUrls(refreshedData.data);
      }

      return results;
    } catch (err) {
      // console.error("❌ Error in batch update:", err);
      showNotify("error", "Failed to update URLs");
      throw err;
    }
  };
  async function handleExport() {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;

    try {
      setExportLoading(true);
      const results = await Promise.all(
        ids.map(async (id) => {
          let url = await buildGetUrlsUrl(
            `${API_BASE}/guest/url/get-data/${id}`,
            `${API_BASE}/user/url/get-data/${id}`
          );
          const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...getXsrfHeader(),
            },
            credentials: "include",
          });
          if (!res.ok) throw new Error(`Failed: ${id}`);
          return await res.json();
        })
      );

      const data = JSON.stringify(results, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const urls = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urls;
      a.download = `lynkr_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(urls);
    } catch (err) {
      // console.error("Export failed:", err);
    } finally {
      setExportLoading(false);
    }
  }
  const [tooltipState, setTooltipState] = useState(null); // { id, link, rect } | null

  // openUrl used by FavoritesPanel
  const openUrl = useCallback((link) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  }, []);

  // deleteUrl used to finalize removals
  const deleteUrl = useCallback((idOrObj) => {
    console.log(idOrObj);
    handleToggleFavourite(idOrObj);
  }, []);

  // optional undo handler (no-op here)
  const undoDelete = useCallback((_id) => {}, []);

  const ctxValue = useMemo(() => {
    return {
      urls,
      openUrl,
      deleteUrl,
      // expose setTooltipState so FavoritesPanel can call it
      setTooltipState,
      // you can expose other helpers too (updateRootBackground, fetchBackgrounds etc.)
    };
  }, [urls, openUrl, deleteUrl, setTooltipState]);

  return (
    // <NoteContext.Provider value={{ apiData, addNote, deleteNote, editNote ,getdata}}>
    <UrlContext.Provider
      value={{
        getXsrfHeader,
        canonicalUrl,
        API_BASE,
        userInfoData,
        setUserInfoData,
        addUrl,
        updateUrl,
        getAllUrls,
        getUrlById,
        formData,
        setFormData,
        urls,
        setUrls,
        deleteUrlPost,
        archive,
        setArchive,
        notify,
        setNotify,
        showNotify,
        search,
        setSearch,
        filtered,
        updateClickCount,
        onKeep,
        fetchAndLogUser,
        ensureSession,
        setShowAuthLimit,
        isEditOpen,
        setIsEditOpen,
        makeAuthenticatedRequest,
        logout,
        getCsrfToken,
        user,
        setUser,
        selectedIds,
        setSelectedIds,
        batchUpdateUrlStatus,
        handleExport,
        exportLoading,
        activeSort,
        setActiveSort,
        setScreenLoading,
        screenLoading,
        isLoggedIn,
        setIsLoggedIn,
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        otp_token,
        setOtpToken,
        themeImage,
        setThemeImage,
        openLoginModel,
        setOpenLoginModel,
        openSignupModel,
        setOpenSignupModel,
        openverifyOTPModel,
        setOpenVerifyOTPModel,
        updateRootBackground,
        statsView,
        setStatsView,
        tagsView,
        setTagsView,
        openProfileModel,
        setOpenProfileModel,
        updateUserName,
        setShowAuthFeature,
        urlsView,
        setUrlsView,
        showDetails,
        setShowDetails,
        showDetailsView,
        setShowDetailsView,
        openSettings,
        setSettingsOpen,
        fetchBackgrounds,
        setTooltipState,
        tooltipState,
        ctxValue,
        webNotifications,
        setWebNotifications,
        notifications,
        setNotifications,
        getNotifications,
        addTag,
        userTags,
        setUserTags,
        updateTag,
        deleteTag,
        getTags,
        friendsModalOpen,
        setFriendsModalOpen,
        termsAndConditionsModalOpen,
        setTermsAndConditionsModalOpen,
        termsData,
        setTermsData,
        fetchTerms,
        privacyData,
        setPrivacyData,
        fetchPrivacyData,
      }}
    >
      {props.children}
      {showAuthLimit && (
        <AuthLimitModal
          setOpenSignupModel={setOpenSignupModel}
          setOpenLoginModel={setOpenLoginModel}
          onClose={() => setShowAuthLimit(false)}
        />
      )}
      {showAuthFeature && (
        <AuthFeatureModal
          setOpenSignupModel={setOpenSignupModel}
          setOpenLoginModel={setOpenLoginModel}
          onClose={() => setShowAuthFeature(false)}
        />
      )}
      {tooltipState && (
        <TooltipRemove
          id={tooltipState.id}
          link={tooltipState.link}
          rect={tooltipState.rect}
          onFinalize={(id) => {
            deleteUrl(id);
            setTooltipState(null);
          }}
          onUndo={(id) => {
            // nothing to undo because finalize removed on finalize
            setTooltipState(null);
          }}
          onClose={() => setTooltipState(null)}
        />
      )}
    </UrlContext.Provider>
  );
};

export default UrlState;
