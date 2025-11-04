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

export default function FavoritesPanel({ maxItems = 24, tileSize = "medium" }) {
  const ctx = useContext(UrlContext);
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

function computeItemsPerSlide(width) {
  if (width <= 340) return 3; // very small phones
  if (width <= 488) return 4; // small phones
  if (width <= 768) return 5; // tablets
  if (width <= 1024) return 6; // small desktops
  return 7; // large screens
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



  const slides = useMemo(() => {
    const out = [];
    for (let i = 0; i < favouriteLinks.length; i += itemsPerSlide) {
      out.push(favouriteLinks.slice(i, i + itemsPerSlide));
    }
    return out.length ? out : [[]];
  }, [favouriteLinks]);

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
        const slideWidth = node.clientWidth;
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
                  <div key={link.id} className="lnk-fav-tile" role="listitem">
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
