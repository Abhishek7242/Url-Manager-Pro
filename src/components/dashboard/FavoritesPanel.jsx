// FavoritesPanel.jsx
import React, {
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { Icon } from "@iconify/react";
import UrlContext from "../../context/url_manager/UrlContext";
import "../CSS/FavoritesPanel.css";

export default function FavoritesPanel({
  maxItems = 24,
  tileSize = "medium",
  showMoreItems = false,
}) {
  const ctx = useContext(UrlContext);
  // if you want to grab other context helpers like in your example:
  // const { updateRootBackground, fetchBackgrounds } = ctx || {};
  // get tooltip setter if provider exposes it
  const setTooltipState =
    ctx?.setTooltipState || ctx?.openRemoveTooltip || ctx?.setRemoveTooltip;

  const allLinks = Array.isArray(ctx?.urls) ? ctx.urls : [];

  const favouriteLinks = useMemo(() => {
    return allLinks
      .filter(
        (link) =>
          Array.isArray(link.tags) &&
          link.tags.some((t) => String(t).toLowerCase() === "#favourite")
      )
      .slice(0, maxItems);
  }, [allLinks, maxItems]);

  function computeItemsPerSlide(width, showMore = false) {
    let items;

    if (width <= 340) items = 3; // very small phones
    else if (width <= 488) items = 4; // small phones
    else if (width <= 768) items = 5; // tablets
    else items = 6; // desktops & large screens

    if (showMore) {
      if (width >= 1408) items += 5; // 5 -> 7
    }

    return items;
  }

  const isClient = typeof window !== "undefined";

  const [itemsPerSlide, setItemsPerSlide] = useState(
    () =>
      isClient ? computeItemsPerSlide(window.innerWidth, showMoreItems) : 4 // SSR fallback
  );

  // single resize listener (rAF-throttled), and run once immediately
  useLayoutEffect(() => {
    if (!isClient) return;

    let ticking = false;
    const onResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setItemsPerSlide(
          computeItemsPerSlide(window.innerWidth, showMoreItems)
        );
        ticking = false;
      });
    };

    // call once immediately to apply current showMoreItems
    setItemsPerSlide(computeItemsPerSlide(window.innerWidth, showMoreItems));

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [isClient, showMoreItems]); // re-run when showMoreItems toggles

  // Rebuild slides when either the links OR itemsPerSlide change
  const slides = useMemo(() => {
    const out = [];
    if (!Array.isArray(favouriteLinks) || favouriteLinks.length === 0)
      return [[]];

    for (let i = 0; i < favouriteLinks.length; i += itemsPerSlide) {
      out.push(favouriteLinks.slice(i, i + itemsPerSlide));
    }
    return out.length ? out : [[]];
  }, [favouriteLinks, itemsPerSlide]); // <-- important: include itemsPerSlide

  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const openLink = (link, e) => {
    if (ctx?.openUrl) {
      e.preventDefault();
      ctx.openUrl(link);
    }
  };

  // Convert vertical wheel to horizontal scroll when pointer is over carousel
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    function onWheel(e) {
      if (e.shiftKey) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        node.scrollBy({
          left: e.deltaY,
          behavior: "auto",
        });
      }
    }
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  // Track active slide index based on scroll position
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    let raf;
    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slideWidth = node.clientWidth || 1;
        const scrollLeft = node.scrollLeft;
        const calculated = Math.round(scrollLeft / slideWidth);
        setIndex((prev) => (prev === calculated ? prev : calculated));
      });
    }

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToIndex = useCallback(
    (i) => {
      const node = trackRef.current;
      if (!node) return;
      const clamped = Math.max(0, Math.min(i, slides.length - 1));
      node.scrollTo({ left: clamped * node.clientWidth, behavior: "smooth" });
      setIndex(clamped);
    },
    [slides.length]
  );

  // dynamic grid class if you use it in CSS; fallback to nothing if CSS doesn't rely on it
  const gridClass = `lnk-fav-grid lnk-fav-grid-${itemsPerSlide}`;

  //
  // Minimal long-press + right-click wiring that uses context's setTooltipState if available.
  // If ctx.setTooltipState isn't provided, behavior is unchanged (no tooltip call).
  //
  const tileRefs = useRef({});
  const longPressTimers = useRef({});

  // helper to call context setter if present
  const callContextTooltip = useCallback(
    (link, el) => {
      try {
        console.log(
          "[FavoritesPanel] callContextTooltip invoked for id:",
          link?.id
        );
        if (!el) {
          console.log(
            "[FavoritesPanel] callContextTooltip - no element ref found for id:",
            link?.id
          );
          return;
        }
        const rect = el.getBoundingClientRect();
        console.log("[FavoritesPanel] element rect:", rect);

        if (typeof setTooltipState === "function") {
          console.log(
            "[FavoritesPanel] setTooltipState exists on context, attempting object signature"
          );
          // prefer object signature, fallback to positional
          try {
            setTooltipState({ id: link.id, link, rect });
            console.log(
              "[FavoritesPanel] called setTooltipState({ id, link, rect })"
            );
            return;
          } catch (err) {
            console.warn(
              "[FavoritesPanel] setTooltipState(object) threw, trying positional",
              err
            );
            try {
              setTooltipState(link.id, link, rect);
              console.log(
                "[FavoritesPanel] called setTooltipState(id, link, rect)"
              );
              return;
            } catch (err2) {
              console.warn(
                "[FavoritesPanel] setTooltipState(id,link,rect) threw",
                err2
              );
            }
          }
        } else {
          console.log(
            "[FavoritesPanel] no setTooltipState on context, skipping context call"
          );
        }
      } catch (err) {
        console.error("[FavoritesPanel] callContextTooltip error:", err);
      }
    },
    [setTooltipState]
  );

  const handleTouchStart = (link, id) => (e) => {
    console.log("[FavoritesPanel] touchstart for id:", id);
    if (longPressTimers.current[id]) {
      clearTimeout(longPressTimers.current[id]);
    }
    longPressTimers.current[id] = setTimeout(() => {
      const el = tileRefs.current[id];
      console.log(
        "[FavoritesPanel] long-press triggered for id:",
        id,
        "el:",
        el
      );
      callContextTooltip(link, el);
      longPressTimers.current[id] = null;
    }, 500);
  };

  const handleTouchEnd = (id) => () => {
    console.log("[FavoritesPanel] touchend for id:", id);
    if (longPressTimers.current[id]) {
      clearTimeout(longPressTimers.current[id]);
      longPressTimers.current[id] = null;
    }
  };

  const handleContextMenu = (link, id) => (e) => {
    console.log("[FavoritesPanel] contextmenu event for id:", id, "event:", e);
    e.preventDefault();
    const el = tileRefs.current[id] || e.currentTarget;
    console.log("[FavoritesPanel] contextmenu using element:", el);
    callContextTooltip(link, el);
  };

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(longPressTimers.current).forEach((t) => {
        if (t) clearTimeout(t);
      });
      longPressTimers.current = {};
    };
  }, []);

  return (
    <div
      className={`lnk-fav-carousel-wrap lnk-fav-carousel-${tileSize}`}
      aria-label="Favourites carousel"
    >
      <div
        className="lnk-fav-carousel-viewport lnk-fav-carousel-scroll-snap"
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        tabIndex={0}
      >
        {slides.map((slideItems, sIdx) => (
          <section
            key={`slide-${sIdx}`}
            className="lnk-fav-carousel-slide"
            aria-roledescription="slide"
            aria-label={`Slide ${sIdx + 1} of ${slides.length}`}
            data-slide-index={sIdx}
          >
            <div className="lnk-fav-grid lnk-fav-grid-6" role="list">
              {slideItems.length === 0 ? (
                <div className="lnk-fav-grid-empty">No favourites yet.</div>
              ) : (
                slideItems.map((link) => (
                  <div
                    key={link.id}
                    className="lnk-fav-tile"
                    role="listitem"
                    ref={(el) => {
                      if (el) tileRefs.current[link.id] = el;
                      else delete tileRefs.current[link.id];
                    }}
                    onContextMenu={handleContextMenu(link, link.id)}
                    onTouchStart={handleTouchStart(link, link.id)}
                    onTouchEnd={handleTouchEnd(link.id)}
                    onTouchCancel={handleTouchEnd(link.id)}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lnk-fav-tile-link"
                      title={link.title || link.url}
                      onClick={(e) => openLink(link, e)}
                    >
                      <div className="lnk-fav-tile-surface" aria-hidden>
                        {getFavicon(link) ? (
                          <img
                            src={getFavicon(link)}
                            alt=""
                            className="lnk-fav-tile-icon"
                          />
                        ) : (
                          <div className="lnk-fav-tile-placeholder">
                            <Icon
                              icon="ph:bookmark-simple"
                              width="28"
                              height="28"
                            />
                          </div>
                        )}
                      </div>

                      <div className="lnk-fav-tile-label" aria-hidden>
                        {link.title
                          ? truncateText(link.title, 18)
                          : truncateText(link.domain || link.url, 18)}
                      </div>
                    </a>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      {/* dots */}
      <div className="lnk-fav-carousel-dots" role="tablist" aria-label="Slides">
        {slides.map((_, i) => (
          <button
            key={`dot-${i}`}
            className={`lnk-fav-dot ${i === index ? "active" : ""}`}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}

// helpers
function truncateText(txt, max) {
  if (!txt) return "";
  return txt.length > max ? txt.slice(0, max - 1) + "…" : txt;
}

function getFavicon(link) {
  if (link?.favicon) return link.favicon;
  try {
    const urlObj = new URL(link.url);
    return `https://www.google.com/s2/favicons?sz=128&domain=${urlObj.hostname}`;
  } catch {
    return null;
  }
}
