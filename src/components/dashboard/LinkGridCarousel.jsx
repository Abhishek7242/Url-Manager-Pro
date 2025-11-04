import React, { useEffect, useRef, useState, useCallback } from "react";
import LinkCard from "./LinkCard";
import "../CSS/LinkGridCarousel.css";

export default function LinkGridCarousel({
  urls = [],
  itemsPerPage = 6,
  tileSize = 90,
  tileGap = 10,
  activeMode = "grid",
}) {
  const viewportRef = useRef(null);
  const pageRefs = useRef([]);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil((urls?.length || 0) / itemsPerPage));
  const pages = Array.from({ length: totalPages }).map((_, pIndex) =>
    (urls || []).slice(
      pIndex * itemsPerPage,
      pIndex * itemsPerPage + itemsPerPage
    )
  );

  const pageExtraPadding = 36;

  const calcPageWidth = useCallback(() => {
    return (
      itemsPerPage * tileSize + (itemsPerPage - 1) * tileGap + pageExtraPadding
    );
  }, [itemsPerPage, tileSize, tileGap]);

  const [pageWidthPx, setPageWidthPx] = useState(calcPageWidth);

  useEffect(() => {
    setPageWidthPx(calcPageWidth());
    const onResize = () =>
      requestAnimationFrame(() => setPageWidthPx(calcPageWidth()));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcPageWidth]);

  useEffect(() => {
    pageRefs.current = Array(totalPages).fill(null);
  }, [totalPages, activeMode]);

  const rootStyle = {
    "--tiles-per-page": `${itemsPerPage}`,
    "--tile-gap": `${tileGap}px`,
  };

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const left = vp.scrollLeft || 0;
        if (!pageWidthPx || pageWidthPx <= 0) {
          setPage(0);
          return;
        }
        let idx = Math.round(left / pageWidthPx);
        idx = Math.max(0, Math.min(totalPages - 1, idx));
        setPage((prev) => (prev === idx ? prev : idx));
      });
    };

    vp.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      vp.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pageWidthPx, totalPages]);

  useEffect(() => {
    const vp = viewportRef.current;
    setPage(0);
    if (vp) {
      vp.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeMode, totalPages]);

  const goTo = (i) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const left = Math.round(i * pageWidthPx);
    vp.scrollTo({
      left,
      behavior: "smooth",
    });
    setPage(i);
  };

  return (
    <div className="link-grid-carousel" style={rootStyle}>
      <div className="carousel-viewport" ref={viewportRef}>
        {pages.map((pageItems, pIdx) => (
          <div
            key={pIdx}
            ref={(el) => (pageRefs.current[pIdx] = el)}
            className="carousel-page"
          >
            <div className="link-grid-container carousel-slide">
              {pageItems.map((link) => (
                <LinkCard
                  key={link.id ?? `${pIdx}-${Math.random()}`}
                  link={link}
                  activeMode={activeMode}
                />
              ))}

              {pageItems.length < itemsPerPage &&
                Array.from({ length: itemsPerPage - pageItems.length }).map(
                  (_, i) => (
                    <div key={`ph-${pIdx}-${i}`} className="grid-placeholder" />
                  )
                )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pager-dots-row">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot-btn ${i === page ? "active" : ""}`}
              onClick={() => goTo(i)}
            >
              <span className="dot" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
