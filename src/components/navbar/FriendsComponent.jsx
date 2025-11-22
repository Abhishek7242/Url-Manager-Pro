import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiUsers,
  FiX,
  FiUserPlus,
  FiCopy,
  FiExternalLink,
  FiArrowLeft,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/FriendsComponent.css";

/**
 * FriendsComponent — mobile-friendly single-view behavior
 * - On small screens (<=420px), clicking a user hides left list and shows only URL cards
 * - Back button to return to friends list (keeps modal open)
 * - Keeps lk- class prefixes
 */

export default function FriendsComponent({
  friendsData = null,
  friendsModalOpen = false,
  setFriendsModalOpen = () => {},
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSingleView, setMobileSingleView] = useState(false);

  // Mock data — replace with backend results
  const mockFriends = useMemo(
    () => [
    
      {
        username: "comingsoon",
        name: "This feature is under development",
        status: "",
        avatar: null,
        title: "Coming Soon",
        urls: [
          {
            id: "c1",
            title: "Coming Soon",
            url: "",
            description: "More profiles and integrations coming soon.",
            tags: ["soon"],
          },
        ],
      },
    ],
    []
  );

  const friends = friendsData || mockFriends;

  // Normalize query so @alice works or alice works
  const normalizedQuery = query.trim().replace(/^@/, "").toLowerCase();

  const filtered = friends.filter((f) => {
    if (!normalizedQuery) return true;
    return (
      f.username.toLowerCase().includes(normalizedQuery) ||
      (f.name && f.name.toLowerCase().includes(normalizedQuery)) ||
      (f.title && f.title.toLowerCase().includes(normalizedQuery))
    );
  });

  // detect if exact username already added
  const isAlreadyAdded = (username) => {
    return friends.some(
      (f) => f.username.toLowerCase() === username.toLowerCase()
    );
  };

  // track mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 770px)");
    const set = () => {
      setIsMobile(!!mq.matches);
      // when resizing to desktop, ensure we exit mobile single view
      if (!mq.matches) setMobileSingleView(false);
    };
    set();
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, []);

  // open modal in center for a user
  const openUser = (user) => {
    setSelected(user);
    setFriendsModalOpen(true);
    // if mobile, switch to single-view mode (hide left list)
    if (isMobile) setMobileSingleView(true);
  };

  // Back to friends list on mobile (keeps modal open)
  const backToList = () => {
    setMobileSingleView(false);
    // keep selected cleared so back shows neutral state; remove if you want to remember selection
    setSelected(null);
  };

  // keyboard handler: Escape to close modal and reset single view
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setFriendsModalOpen(false);
        setMobileSingleView(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setFriendsModalOpen]);

  // copy url to clipboard (with tiny fallback)
  const copyToClipboard = async (text) => {
    try {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      console.log("Copied:", text);
    } catch (err) {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        console.log("Copied (fallback):", text);
      } catch (e) {
        console.error("Copy not supported", e);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
          <motion.div
            className="lk-backdrop fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-hidden={!friendsModalOpen}
          >
            {/* Fullscreen blurred layer */}
            <div
              className="lk-blur-layer absolute inset-0"
              onClick={() => {
                setFriendsModalOpen(false);
                setMobileSingleView(false);
              }}
            />

            {/* Modal box centered; conditionally add mobile-single class */}
            <motion.div
              className={`lk-modal relative mx-4 max-w-[760px] w-full min-h-[340px] rounded-2xl shadow-2xl border border-white/10 overflow-hidden`}
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="lk-modal-header flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0f1724]/70 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white">
                    <FiUsers />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Friends</div>
                    <div className="text-xs text-gray-300">
                    Shared links & quick actions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-300">
                    {/* {filtered.length} results */}
                  </div>
                  {/* <button
                    className="lk-close-btn w-9 h-9 rounded-lg bg-white/6 hover:bg-white/10 flex items-center justify-center"
                    onClick={() => {
                      setFriendsModalOpen(false);
                      setMobileSingleView(false);
                    }}
                    aria-label="Close"
                  >
                    <FiX />
                  </button> */}
                </div>
              </div>

              {/* Modal content: split area
                  Add class `lk-modal-body--single` when mobileSingleView to hide left and expand right */}
              <div
                className={`lk-modal-body grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-[#06070a]/80 ${
                  mobileSingleView ? "lk-modal-body--single" : ""
                }`}
              >
                {/* Left: Search + list (hidden on mobileSingleView) */}
                <div className="lk-left min-h-[260px]">
                  <div className="relative mb-4">
                    <FiSearch className="absolute left-4 top-3 text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type @username or name"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                    />
                  </div>

                  <div className="lk-list space-y-3 overflow-auto max-h-[56vh] pr-2">
                    {filtered.map((u) => (
                      <div
                        key={u.username}
                        className="flex items-center justify-between gap-3"
                      >
                        <button
                          onClick={() => openUser(u)}
                          className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/6 transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-black font-semibold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              @{u.username}
                            </div>
                            <div className="text-xs text-gray-300 truncate">
                              {u.name}
                            </div>
                            {u.title && (
                              <div className="text-xs text-gray-400 mt-1 truncate">
                                {u.title}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-300">
                            {u.status}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Selected preview showing multiple URL cards */}
                <div className="lk-right min-h-[260px] flex flex-col gap-4 items-stretch">
                  {/* Mobile Back button — only visible when mobileSingleView */}
                  {isMobile && mobileSingleView && (
                    <div className="lk-mobile-back">
                      <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/6 hover:bg-white/10 transition text-sm"
                        onClick={backToList}
                        aria-label="Back to list"
                      >
                        <FiArrowLeft /> Back
                      </button>
                    </div>
                  )}

                  {selected ? (
                    <>
                      {/* Profile header (keeps same profile name/avatar) */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-yellow-300 flex items-center justify-center text-black font-bold text-xl">
                          {selected.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">
                            @{selected.username}
                          </div>
                          <div className="text-xs text-gray-300">
                            {selected.name}
                          </div>
                          {selected.title && (
                            <div className="text-xs text-gray-400">
                              {selected.title}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* URL cards list */}
                      <div className="lk-url-cards space-y-3 overflow-auto max-h-[46vh] pr-2">
                        {selected.urls && selected.urls.length > 0 ? (
                          selected.urls.map((item) => (
                            <div
                              key={item.id}
                              className="lk-url-card bg-white/4 border border-white/6 rounded-lg p-3 transition hover:scale-[1.01]"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-medium truncate">
                                      {item.title || "Untitled"}
                                    </div>
                                    {/* <div className="flex items-center gap-2">
                                      <button
                                        className="lk-action-btn text-xs px-2 py-1 rounded-md bg-white/6 hover:bg-white/10"
                                        onClick={() => {
                                          console.log(
                                            "Message about",
                                            item.url || item.id
                                          );
                                        }}
                                      >
                                        Message
                                      </button>
                                      <a
                                        href={item.url || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="lk-action-visit inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700"
                                        title="Open"
                                      >
                                        <FiExternalLink className="inline-block" />{" "}
                                        Visit
                                      </a>
                                    </div> */}
                                  </div>

                                  <div className="mt-1 text-xs text-indigo-300 break-all">
                                    {item.url || "No URL"}
                                  </div>

                                  <div className="mt-2 text-sm text-gray-300 leading-snug">
                                    {item.description ||
                                      "No description available."}
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {(item.tags || []).length > 0 ? (
                                      item.tags.map((t) => (
                                        <span
                                          key={t}
                                          className="px-2 py-1 rounded-full text-xs bg-white/6 text-gray-200"
                                        >
                                          #{t}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-gray-500">
                                        no tags
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 ml-3">
                                  <button
                                    className="lk-copy-btn w-9 h-9 rounded-md bg-white/6 hover:bg-white/10 flex items-center justify-center"
                                    onClick={() =>
                                      copyToClipboard(item.url || "")
                                    }
                                    title="Copy URL"
                                  >
                                    <FiCopy />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-400 py-6 rounded-xl bg-white/3">
                            No URLs for this profile
                          </div>
                        )}
                      </div>

                      {/* Footer quick action: share or add new url */}
                      {/* <div className="flex gap-3 mt-3">
                        <button
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition"
                          onClick={() => {
                            console.log("Add new URL for", selected.username);
                          }}
                        >
                          Add URL
                        </button>
                        <button
                          className="flex-1 py-2 rounded-xl bg-white/6 hover:bg-white/10 transition"
                          onClick={() => {
                            const all = (selected.urls || [])
                              .map((u) => u.url)
                              .join("\n");
                            copyToClipboard(all);
                            console.log(
                              "Shared/ copied all urls for",
                              selected.username
                            );
                          }}
                        >
                          Copy all
                        </button>
                      </div> */}
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                      <div className="text-xl mb-2">No user selected</div>
                      <div className="text-sm">
                        Click any user on the left to open a quick preview
                      </div>
                      <div className="mt-4">
                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/6 hover:bg-white/10 transition text-sm"
                          onClick={() => setSelected(filtered[0] || null)}
                        >
                          Quick select
                          <FiUserPlus />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
      </AnimatePresence>
    </>
  );
}
