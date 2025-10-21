import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { FiAlertTriangle, FiTag, FiTrendingUp, FiLoader } from "react-icons/fi";
import "./CSS/Suggestions.css";
import UrlContext from "../context/url_manager/UrlContext";
import AddTagsLinksModal from "./suggestion/AddTagsLinksModel";
import EditUrlModal from "./dashboard/EditUrlModal";
import NeonOrbitalLoader from "./NeonOrbitalLoader";
import OptimizedCard from "./suggestion/OptimizedCard";

export default function Suggestions() {
  const {
    getAllUrls,
    setUrls,
    filtered,
    isEditOpen,
    setIsEditOpen,
    setScreenLoading,
  } = useContext(UrlContext);

  // Separate loading states
  const [initialLoading, setInitialLoading] = useState(true); // for getAllUrls
  const [checking, setChecking] = useState(false); // for URL health checks
  const [brokenUrls, setBrokenUrls] = useState([]);

  // generation ref to ignore stale results
  const checkIdRef = useRef(0);
  // store controllers so we can abort on cleanup
  const controllersRef = useRef([]);
  const [open, setOpen] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);

  // 1) Initial fetch (mount)
  useEffect(() => {
    let mounted = true;
    const fetchUrls = async () => {
      setInitialLoading(true);
      try {
        const res = await getAllUrls();
        if (mounted && res && res.data) {
          setUrls(res.data);
        }
      } catch (err) {
        // console.error("❌ Error fetching URLs:", err);
      } finally {
        if (mounted) setInitialLoading(false);
        setScreenLoading(false)
      }
    };

    fetchUrls();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // 2) Health check effect: runs whenever `filtered` changes
  useEffect(() => {
    // if nothing to check, clear broken list and don't show checking spinner
    if (!filtered || filtered.length === 0) {
      // cancel any in-flight controllers
      controllersRef.current.forEach((c) => c.abort && c.abort());
      controllersRef.current = [];
      setBrokenUrls([]);
      setChecking(false);
      return;
    }

    const myCheckId = ++checkIdRef.current;
    controllersRef.current = []; // reset controllers for this run
    setChecking(true);

    const doChecks = async () => {
      const brokenLocal = [];

      // map to promises
      const promises = filtered.map(async (u) => {
        // quick validation
        if (!u.url || !/^https?:\/\//i.test(u.url)) {
          brokenLocal.push(u);
          return;
        }

        // create an AbortController per request so we can cancel if needed
        const controller = new AbortController();
        controllersRef.current.push(controller);
        const timeout = setTimeout(() => controller.abort(), 4000);

        try {
          // HEAD + no-cors: we only detect network failures/timeouts via catch
          await fetch(u.url, {
            method: "HEAD",
            mode: "no-cors",
            signal: controller.signal,
          }).catch(() => {
            brokenLocal.push(u);
          });
        } catch (err) {
          // aborts or other errors
          brokenLocal.push(u);
        } finally {
          clearTimeout(timeout);
        }
      });

      // wait for all checks to finish
      await Promise.all(promises);

      // Only apply results if this check is the latest
      if (checkIdRef.current === myCheckId) {
        setBrokenUrls(brokenLocal);
        setChecking(false);
      }
    };

    doChecks();

    // cleanup: abort all controllers if filtered changes / effect re-runs or component unmounts
    return () => {
      controllersRef.current.forEach((c) => c.abort && c.abort());
      controllersRef.current = [];
    };
  }, [filtered]);

  // Generate suggestions — depends on both filtered and brokenUrls
  const suggestions = useMemo(() => {
    if (!filtered || filtered.length === 0) return [];

    const s = [];

    // Only show broken URLs suggestion after health check is complete
    if (!checking && brokenUrls && brokenUrls.length > 0) {
      s.push({
        id: "1",
        title: "Clean Up Broken URLs",
        description: `${brokenUrls.length} URLs appear to be broken or inaccessible.`,
        severity: "high",
        affectedCount: `${brokenUrls.length} URLs affected`,
        buttonLabel: "Review URLs",
        icon: "alert",
      });
    }

    const untaggedUrls = filtered.filter(
      (url) => !url.tags || url.tags.length === 0
    );
    if (untaggedUrls.length > 0) {
      s.push({
        id: "2",
        title: "Add Tags to URLs",
        description: `${untaggedUrls.length} URLs don't have tags. Adding tags helps organize your collection.`,
        severity: "medium",
        affectedCount: `${untaggedUrls.length} URLs affected`,
        buttonLabel: "Add Tags",
        icon: "tag",
      });
    }

    return s;
  }, [filtered, brokenUrls, checking]);

  const handleSuggFix = (label) => {
    switch (label) {
      case "Review URLs": {
        // Set broken URLs for review
        setSelectedLinks(brokenUrls);
        setOpen(true);
        break;
      }

      case "Add Tags": {
        // Set untagged URLs for tagging
        const untaggedUrls = filtered.filter(
          (url) => !url.tags || url.tags.length === 0
        );
        setSelectedLinks(untaggedUrls);
        setOpen(true);
        break;
      }

      default:
        // console.log("Unknown action:", label);
    }
  };
   function handleAddUrl(newLink) {
     // newLink is the object produced by the modal
     setUrls((prev) => [newLink, ...prev]);
   }
  // Combined "loading" for the UI: show main (full) loader only when initialLoading.
  // Show smaller/checker loader only inside the suggestions area while checking is true.

  // If we're still fetching initial data, show the full page loader (no flicker from checking)
  if (initialLoading) {
    return (
      <div className="relative h-full pt-32 w-full flex items-center justify-center">
        <NeonOrbitalLoader />
      </div>
    );
  }

  // After initial load, render suggestions area. During `checking` we can show a small inline loader.
  return (
    <div className="sugg-root-container">
      <EditUrlModal
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              onAdd={(link) => handleAddUrl(link)}
            />
      <AddTagsLinksModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setSelectedLinks([]);
        }}
        links={selectedLinks}
      />
   

      {!suggestions || (suggestions.length === 0 && !checking) ? (
        <OptimizedCard/>
      ) : (
          
        <div className="sugg-grid">
          {suggestions.map((s) => (
            <div key={s.id} className="sugg-card">
              <div className="sugg-card-top">
                <div className="sugg-card-title">
                  {s.icon === "alert" ? <FiAlertTriangle /> : <FiTag />}
                  <span>{s.title}</span>
                </div>
                <span className={`badge ${s.severity}`}>{s.severity}</span>
              </div>

              <p className="sugg-desc">{s.description}</p>

              <div className="sugg-meta">
                <span className="affected">{s.affectedCount}</span>
                <button
                  className="sugg-btn"
                  onClick={() => handleSuggFix(s.buttonLabel)}
                >
                  {s.buttonLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
