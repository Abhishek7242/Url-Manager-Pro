import React, { useState, useEffect, useContext } from "react";
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
} from "react-icons/fi";

import "./CSS/Dashboard.css";
import SelectionToolbar from "./dashboard/SelectionToolbar";
import AddUrlModal from "./dashboard/AddUrlModal";
import EditUrlModal from "./dashboard/EditUrlModal";
import UrlContext from "../context/url_manager/UrlContext";
import SortButtons from "./dashboard/SortButtons";

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
  } = context;

  const [loading, setLoading] = useState(true);

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
      }
    };

    fetchUrls(); // call it
  }, []);

  const [activeMode, setActiveMode] = useState("grid");
  const [selectAll, setSelectAll] = useState(false);

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
    setActiveMode(mode);
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="sugg-root">
        <div className="sugg-clean">
          <div className="sugg-icon loading-icon">
            <FiLoader />
          </div>
          <h3>Loading Urls...</h3>
        </div>
      </div>
    );
  }

  return (
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
      {filtered.length > 0 && (
        <section className="search-card">
          <div className="search-header">
            <div className="search-left">
              <FiSearch /> <h4 className=" text-3xl">Search & Filter</h4>
            </div>

            <div className="search-right">
              <button className="filter-btn">
                <FiFilter /> Filters
              </button>
            </div>
          </div>

          <div className="search-input">
            <FiSearch className="sicon" />
            <input
              placeholder="Search URLs, notes, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
        <SortButtons/>
          </div>
        </section>
      )}

      <div className="controls">
        <button className="add-btn" onClick={() => setIsAddOpen(true)}>
          <FiPlus /> Add URL
        </button>
        <div className="active-toggle">
          <label className="switch">
            <input
              checked={archive}
              type="checkbox"
              onChange={(e) => setArchive(e.target.checked)}
            />
            <span className="slider" />
          </label>

          {/* 👇 Dynamic icon */}
          {archive ? (
            <FiEye className="icon active-icon" />
          ) : (
            <FiEyeOff className="icon inactive-icon" />
          )}

          <span className="">{archive ? "InActive" : "Active"}</span>
        </div>

        <div className="view-toggle" role="tablist" aria-label="View toggle">
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
        <div className="right-info">
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
        </div>
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

      <div className={`cards-wrap ${activeMode}`}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiLink />
            </div>
            <h3>No URLs saved yet</h3>
            <p>Start by adding your first URL with notes and reminders</p>
            <button className="add-url-btn" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add URL
            </button>
          </div>
        ) : (
          filtered.map((l) => (
            <div key={l.id} className="card-col">
              <LinkCard
                link={l}
                activeMode={activeMode}
                selected={!!selectedIds[l.id]}
                onSelect={handleSelect}
                onDelete={(id) => {
                  setUrls((prev) => prev.filter((x) => x.id !== id));
                }}
                onShare={(link) => {
                  // example: copy to clipboard
                  navigator.clipboard.writeText(link.url);
                  alert("URL copied to clipboard");
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
