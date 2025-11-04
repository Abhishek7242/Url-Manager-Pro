import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from "react";
import LinkCard from "./dashboard/LinkCard";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiList,
  FiLoader,
  FiLink,
  FiX,
  FiZap,
  FiSettings,
  FiMoreVertical,
  FiStar,
  FiChevronsDown,
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
} from "lucide-react";
import "./CSS/Dashboard.css";
import SelectionToolbar from "./dashboard/SelectionToolbar";
import AddUrlModal from "./dashboard/AddUrlModal";
import EditUrlModal from "./dashboard/EditUrlModal";
import UrlContext from "../context/url_manager/UrlContext";
import SortButtons from "./dashboard/SortButtons";
import SearchFilter from "./dashboard/SearchFilter";
import NeonOrbitalLoader from "./NeonOrbitalLoader";
import { a, div } from "framer-motion/client";
import EmptyURLsCard from "./dashboard/EmptyURLsCard";
import StatsCard from "./dashboard/StatsCard";
import CustomTags from "./dashboard/CustomTags";
import Settings from "./dashboard/Settings";
import BackgroundSettings from "./dashboard/BackgroundSettings";
import LinkGridCarousel from "./dashboard/LinkGridCarousel";
import FavoritesPanel from "./dashboard/FavoritesPanel";
import ShowDetails from "./dashboard/ShowDetails";
import { set } from "date-fns";
import DisableTags from "./dashboard/DisableTags";

export default function Dashboard() {
  const context = useContext(UrlContext);
  const {
    getAllUrls,
    urls,
    setUrls,
    archive,
    setArchive,
    search,
    setSearch,
    filtered,
    isEditOpen,
    setIsEditOpen,
    selectedIds,
    setSelectedIds,
    batchUpdateUrlStatus,
    deleteUrlPost,
    handleExport,
    exportLoading,
    screenLoading,
    setScreenLoading,
    showNotify,
    addUrl,
    statsView,
    setStatsView,
    tagsView,
    setTagsView,
    isLoggedIn,
    setShowAuthFeature,
    urlsView,
    setUrlsView,
    showDetails,
    showDetailsView,
    setShowDetailsView,
  } = context;
  
  const [loading, setLoading] = useState(true);
  const [openSerch, setOpenSerch] = useState(false);
  const [isQuickAddLoading, setIsQuickAddLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const [activeMode, setActiveMode] = useState(localStorage.getItem("activeUrlMode") || "list");
  const [showDropdown, setShowDropdown] = useState(false);
    const [disabledTags, setDisabledTags] = useState(
      JSON.parse(localStorage.getItem("lynkr_disabled_tags")) || []
    );
 
const [showMoreItems, setShowMoreItems] = useState(false);
const [showFavourites, setShowFavourites] = useState(() => {
  const stored = localStorage.getItem("lynkr_tabs_view");
  return stored !== null ? stored === "true" : true;
});
const [hideTopSites, setHideTopSites] = useState(false);
  const inputRef = useRef(null);
   const [menuOpen, setMenuOpen] = useState(false);
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
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);
  useEffect(() => {
    // define async function inside useEffect
    const fetchUrls = async () => {
      setLoading(true);
      try {
        const res = await getAllUrls(); // call API function
        // console.log("✅ API Response:", res.data); // full response object
        setUrls(res.data); // save to state
      } catch (err) {
        console.error("❌ Error fetching URLs:", err);
      } finally {
        setLoading(false);
        setScreenLoading(false);
      }
    };

    fetchUrls(); // call it
  }, []);
    useEffect(() => {
      const saved = localStorage.getItem("lynkr_toggles");

      if (saved) {
        // 🔹 Load from localStorage
        const toggles = JSON.parse(saved);
        const stats = toggles.find((r) => r.id === "stats");
        const tags = toggles.find((r) => r.id === "tags");

        setStatsView(stats?.enabled ? "visible" : "");
        setTagsView(tags?.enabled ? "visible" : "");
        setUrlsView(tags?.enabled ? "visible" : "");
      } else {
        // 🔹 If not present in localStorage, default both ON and save it
        const defaultToggles = [
          { id: "stats", label: "Lynkr Stats", enabled: true },
          { id: "tags", label: "Lynkr Tags", enabled: true },
        ];

        localStorage.setItem("lynkr_toggles", JSON.stringify(defaultToggles));

        setStatsView("visible");
        setTagsView("visible");
        setUrlsView("visible");
      }
    }, []);

function computeItemsPerSlide(width) {
  if (width <= 340) return 3; // very small phones
  if (width <= 488) return 4; // small phones
  if (width <= 768) return 5; // tablets
  if (width <= 1024) return 6; // small desktops
  return 6; // large screens
}

const isClient = typeof window !== "undefined";

const [itemsPerSlide, setItemsPerSlide] = useState(
  () => (isClient ? computeItemsPerSlide(window.innerWidth) : 4) // SSR fallback
);

// Run before paint to avoid the “4 → snap” flicker
useLayoutEffect(() => {
  if (!isClient) return;
  setItemsPerSlide(computeItemsPerSlide(window.innerWidth));
}, []);

// Resize listener (throttled with rAF)
useEffect(() => {
  if (!isClient) return;

  let ticking = false;
  const onResize = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setItemsPerSlide(computeItemsPerSlide(window.innerWidth));
      ticking = false;
    });
  };

  window.addEventListener("resize", onResize, { passive: true });
  return () => window.removeEventListener("resize", onResize);
}, []);

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

  const [selectAll, setSelectAll] = useState(false);
  const [tags, setTags] = useState([
    { id: "1", label: "Work", icon: null },
    { id: "2", label: "Research", icon: null },
    { id: "3", label: "Education", icon: null },
    { id: "4", label: "AI", icon: null },
    { id: "5", label: "Reading", icon: null },
  ]);
  const [selected, setSelected] = useState(["1"]);

  const handleSelect = (id, isChecked) => {
    setSelectedIds((prev) => {
      const newSelection = { ...prev };
      if (isChecked) {
        newSelection[id] = true;
      } else {
        delete newSelection[id];
      }
      // console.log("Selected IDs:", Object.keys(newSelection));
      return newSelection;
    });
  };

  function toggleSelectAll() {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // Select all filtered items
      const allSelected = {};
      filtered.forEach((item) => {
        allSelected[item.id] = true;
      });
      setSelectedIds(allSelected);
    } else {
      // Deselect all
      setSelectedIds({});
    }
  }

  const [isAddOpen, setIsAddOpen] = useState(false);

  function handleAddUrl(newLink) {
    // newLink is the object produced by the modal
    setUrls((prev) => [newLink, ...prev]);
  }

  // inside Dashboard component (after state declarations)
  const selectedCount = Object.keys(selectedIds).length;

  // handlers for toolbar actions
  function handleTag() {
    // e.g., open tag modal or add quick tag to all selected
    alert(`Tag ${selectedCount} items (implement modal)`);
  }

  const [archiveLoading, setArchiveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleArchive() {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;

    setArchiveLoading(true);
    try {
      // If in archive view, set status to active (unarchive), otherwise set to archived
      const newStatus = archive ? "active" : "archived";
      await batchUpdateUrlStatus(ids, newStatus);

      // Refresh the URLs list
      const refreshedUrls = await getAllUrls();
      if (refreshedUrls && refreshedUrls.data) {
        setUrls(refreshedUrls.data);
      }

      // Clear selections after successful update
      setSelectedIds({});
      setSelectAll(false);
    } catch (err) {
      // console.error(
      //   `Failed to ${archive ? "unarchive" : "archive"} URLs:`,
      //   err
      // );
    } finally {
      setArchiveLoading(false);
    }
  }

  async function handleDelete() {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;

    setDeleteLoading(true);
    try {
      // Delete each URL using the context function
      for (const id of ids) {
        await deleteUrlPost(id);
      }

      // Refresh the URLs list
      const refreshedUrls = await getAllUrls();
      if (refreshedUrls && refreshedUrls.data) {
        setUrls(refreshedUrls.data);
      }

      // Clear selections after successful delete
      setSelectedIds({});
      setSelectAll(false);
    } catch (err) {
      // console.error("Failed to delete URLs:", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  const handleClick = (mode) => {
    localStorage.setItem("activeUrlMode", mode);
    setActiveMode(mode);
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <NeonOrbitalLoader/>
    );
  }
  const handleQuickSubmit = async (e) => {
    e.preventDefault();
console.log( 'handel quick submit',url);
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
      tags: ['#quicklink'],
      url_clicks: 0,
      id: Date.now().toString(), // Add temporary ID for immediate display
    };

    try {
      // Add to URLs array immediately for real-time update
      setUrls((prevUrls) => [newLink, ...prevUrls]);

      // Then send to API
      let res = await addUrl(newLink);
      if (res) {
      setUrl("");
        setSearch("")
        setInputFocus(false);
          inputRef.current?.blur();
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
    }
  };
 
  return (
    <>
      {/* <BackgroundSettings/> */}
      {showDetailsView && (
        <ShowDetails
          item={showDetails}
          onEdit={(it) => console.log("edit", it)}
          onDelete={(it) => console.log("delete", it)}
          onClose={() => setShowDetailsView(false)}
        />
      )}
      {/* <div className="fixed-settings" title="Settings">
        <FiSettings className="settings-icon" />
      </div> */}

      {openSerch && (
        <SearchFilter
          search={search}
          setSearch={setSearch}
          setOpenSerch={setOpenSerch}
        />
      )}
      <div className="dashboard">
        <AddUrlModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={(link) => handleAddUrl(link)}
        />
        <EditUrlModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onAdd={(link) => handleAddUrl(link)}
        />

        <div className="controls flex flex-col">
          {tagsView && (
            <div className="flex justify-center gap-2 w-full items-center">
              {showFavourites ? (
                <>
                  <CustomTags
                    inputFocus={inputFocus}
                    tags={tags}
                    selected={selected}
                    onChange={(next) => setTags(next)}
                    onSelectChange={(sel) => setSelected(sel)}
                    allowAdd={true}
                    showDropdown={showDropdown}
                    setShowDropdown={(s) => setShowDropdown(s)}
                    disabledTags={disabledTags}
                    setDisabledTags={(t) => setDisabledTags(t)}
                  />
                  {showDropdown && (
                    <DisableTags
                      tags={tags}
                      setDisabledTags={setDisabledTags}
                      disabledTags={disabledTags}
                      onChange={(next) => setTags(next)}
                      onClick={() => setShowDropdown(!showDropdown)}
                    />
                  )}
                </>
              ) : (
                <FavoritesPanel />
              )}

              <div className="more-wrap">
                <button
                  className="icon-btn more-btn"
                  title="Customize"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  ref={btnRef}
                  onClick={() => setMenuOpen((s) => !s)}
                >
                  <FiMoreVertical urls={urls} />
                </button>

                {menuOpen && (
                  <div
                    className="customize-menu"
                    role="menu"
                    aria-label="Customize options"
                    ref={menuRef}
                  >
                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() => {
                        setShowMoreItems((s) => !s);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="menu-left">
                        <FiChevronsDown />
                      </span>
                      <span className="menu-label">Show more items</span>
                      <span className="menu-check">
                        {showMoreItems ? "✓" : ""}
                      </span>
                    </button>

                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() => {
                        console.log(isLoggedIn);
                        if (isLoggedIn) {
                          setShowFavourites((prev) => {
                            const newValue = !prev;
                            localStorage.setItem(
                              "lynkr_tabs_view",
                              JSON.stringify(newValue)
                            );
                            setMenuOpen(false);
                            return newValue;
                          });
                        } else {
                          setShowAuthFeature(true);
                          setMenuOpen(false);
                          // Show login-required modal
                        }

                        // Close the menu only if user is logged in
                      }}
                    >
                      <span className="menu-left">
                        {showFavourites ? <FiStar /> : <Tag />}
                      </span>
                      <span className="menu-label">
                        {" "}
                        {showFavourites ? "Show favourites" : "Show Tags"}
                      </span>
                    </button>

                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() => {
                        // setHideTopSites((s) => !s);
                        // setMenuOpen(false);
                      }}
                    >
                      <span className="menu-left">
                        <FiEyeOff />
                      </span>
                      <span className="menu-label">Hide menu</span>
                      <span className="menu-check">
                        {/* {hideTopSites ? "✓" : ""} */}
                      </span>
                    </button>
                    <button
                      className="menu-item"
                      title="Enable disabled tags"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDropdown(!showDropdown)
                      }}
                    >
                      <span className="menu-left">
                        <FiEyeOff />
                      </span>
                      <span className="menu-label">Disabled Tags</span>
                      <span className="menu-check">
                        {/* {hideTopSites ? "✓" : ""} */}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="search-bar-container">
            <form
              className={`search-bar  ${inputFocus ? "focus" : ""}`}
              onSubmit={handleQuickSubmit}
            >
              <input
                type="text"
                className="search-input"
                value={search}
                ref={inputRef}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUrl(e.target.value);
                  if (e.target.value == "") {
                    setUrlsView("");
                  } else {
                    setUrlsView("visible");
                  }
                }}
                placeholder="Search or paste a link..."
              />
              <div className="btn-group">
                <button
                  type="submit"
                  className="add-btn quick"
                  disabled={isQuickAddLoading || !url.trim()}
                >
                  {isQuickAddLoading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiZap /> <span>Quick Add</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="add-btn main"
                  onClick={() => setIsAddOpen(true)}
                >
                  <FiPlus /> <span>Add</span>
                </button>
              </div>
            </form>
          </div>
          {/* 
          <div className="active-toggle">
            <label className="switch">
              <input
                checked={archive}
                type="checkbox"
                onChange={(e) => setArchive(e.target.checked)}
              />
              <span className="slider" />
            </label>

      
            {archive ? (
              <FiEye className="icon active-icon" />
            ) : (
              <FiEyeOff className="icon inactive-icon" />
            )}

            <span className="">{archive ? "InActive" : "Active"}</span>
          </div> */}

          {/* <div className="view-toggle" role="tablist" aria-label="View toggle">
            <button
              className={`vt-btn ${activeMode === "grid" ? "active" : ""}`}
              role="tab"
              aria-selected={activeMode === "grid"}
              title="Grid view"
              onClick={() => handleClick("grid")}
            >
              <FiGrid />
            </button>

            <button
              className={`vt-btn ${activeMode === "list" ? "active" : ""}`}
              role="tab"
              aria-selected={activeMode === "list"}
              title="List view"
              onClick={() => handleClick("list")}
            >
              <FiList />
            </button>
            
          <button
          className={`vt-btn ${activeMode === "eye" ? "active" : ""}`}
          role="tab"
          aria-selected={activeMode === "eye"}
          title="Show / Hide"
          onClick={() => handleClick("eye")}
          >
          <FiEye />
          </button>
          </div> */}
          {/* <div className="right-info">
            {filtered.length > 0 && (
              <div className="select-all">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                <span>Select all</span>
              </div>
            )}
            <div className="count">{filtered.length} URLs</div>
            <div className="search-right">
              <button onClick={() => setOpenSerch(true)} className="filter-btn">
                <FiFilter /> Filters
              </button>
            </div>
          </div> */}
          {urlsView && (
            <div
              className={`cards-wrap ${activeMode} w-full ${
                inputFocus ? "focus" : ""
              }`}
            >
              {filtered.length === 0 ? (
                <div className="w-full flex justify-center">
                  <EmptyURLsCard onAdd={setIsAddOpen} />
                </div>
              ) : (
                <div className="saved-urls-panel">
                  <div className="saved-header">
                    <h2 className="saved-title">Saved URLs</h2>
                    <div className="saved-actions-text">
                      <div
                        className="view-toggle"
                        role="tablist"
                        aria-label="View toggle"
                      >
                        <button
                          className={`vt-btn ${
                            activeMode === "grid" ? "active" : ""
                          }`}
                          role="tab"
                          aria-selected={activeMode === "grid"}
                          title="Grid view"
                          onClick={() => handleClick("grid")}
                        >
                          <FiGrid />
                        </button>

                        <button
                          className={`vt-btn ${
                            activeMode === "list" ? "active" : ""
                          }`}
                          role="tab"
                          aria-selected={activeMode === "list"}
                          title="List view"
                          onClick={() => handleClick("list")}
                        >
                          <FiList />
                        </button>
                        {/* 
          <button
          className={`vt-btn ${activeMode === "eye" ? "active" : ""}`}
          role="tab"
          aria-selected={activeMode === "eye"}
          title="Show / Hide"
          onClick={() => handleClick("eye")}
          >
          <FiEye />
          </button> */}
                      </div>
                    </div>
                  </div>
                  {activeMode === "grid" ? (
                    // Grid carousel (6 items per slide)
                    <LinkGridCarousel
                      urls={filtered || []}
                      itemsPerPage={itemsPerSlide}
                      activeMode={activeMode}
                    />
                  ) : (
                    <div className="saved-list" role="list">
                      {filtered.map((l) => (
                        <div key={l.id} className="card-col" role="listitem">
                          <LinkCard
                            link={l}
                            activeMode={activeMode}
                            selected={!!selectedIds[l.id]}
                            onSelect={handleSelect}
                            onDelete={(id) => {
                              setUrls((prev) =>
                                prev.filter((x) => x.id !== id)
                              );
                            }}
                            onShare={(link) => {
                              // example: copy to clipboard
                              navigator.clipboard.writeText(link.url);
                              alert("URL copied to clipboard");
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Selection toolbar */}
        <SelectionToolbar
          selectedCount={selectedCount}
          onTag={handleTag}
          onArchive={handleArchive}
          onExport={handleExport}
          onDelete={handleDelete}
          isArchiving={archiveLoading}
          isExporting={exportLoading}
          isDeleting={deleteLoading}
        />
        {statsView && (
          <StatsCard
            inputFocus={inputFocus}
            urls={filtered.length}
            clicks={totalClicks}
            reminders={remindersCount}
          />
        )}
      </div>
    </>
  );
}
