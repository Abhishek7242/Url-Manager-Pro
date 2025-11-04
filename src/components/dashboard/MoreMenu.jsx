import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../CSS/MoreMenu.css";
import UrlContext from "../../context/url_manager/UrlContext";


/**
 * MoreMenu: floating menu placed near anchorRef
 * - robustly measures the rendered menu and clamps position so it never becomes full-width
 */
export default function MoreMenu({
  anchorRef,
  items = [],
  onClose,
  align = "auto",
}) {
  const context = React.useContext(UrlContext);
  const {
    isLoggedIn,
    setShowAuthFeature, } = context;

  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);
  const triedAdjust = useRef(false);

  // initial compute based on anchor rect
  useEffect(() => {
    if (!anchorRef?.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    // initial estimates
    const estWidth = 220;
    const estHeight = items.length * 40 + 8;

    let left;
    if (align === "left") left = rect.left;
    else if (align === "right") left = rect.right - estWidth;
    else {
      // auto: prefer to the right if fits, else left, else above/below fallback
      if (rect.right + estWidth + 8 < window.innerWidth) {
        left = rect.right + 8;
      } else if (rect.left - estWidth - 8 > 0) {
        left = rect.left - estWidth - 8;
      } else {
        left = Math.max(
          8,
          Math.min(window.innerWidth - estWidth - 8, rect.left)
        );
      }
    }

    let top;
    if (rect.bottom + estHeight + 8 < window.innerHeight) {
      top = rect.bottom + 8;
    } else if (rect.top - estHeight - 8 > 0) {
      top = rect.top - estHeight - 8;
    } else {
      top = Math.max(8, Math.min(window.innerHeight - estHeight - 8, rect.top));
    }

    setPos({ left: Math.round(left), top: Math.round(top) });
    triedAdjust.current = false;
  }, [anchorRef, items.length, align]);

  // After first render, measure actual menu size and clamp so it doesn't overflow / stretch
  useEffect(() => {
    if (!pos || !menuRef.current) return;
    if (triedAdjust.current) return; // only adjust once per open
    triedAdjust.current = true;

    const mRect = menuRef.current.getBoundingClientRect();
    const menuW = mRect.width;
    const menuH = mRect.height;

    let left = pos.left;
    let top = pos.top;

    // if menu extends beyond right edge, shift left
    if (left + menuW + 8 > window.innerWidth) {
      left = Math.max(8, window.innerWidth - menuW - 8);
    }
    // if menu starts before left edge, shift right
    if (left < 8) left = 8;

    // if menu extends below bottom edge, try place above anchor
    if (top + menuH + 8 > window.innerHeight) {
      const rect = anchorRef.current.getBoundingClientRect();
      const altTop = rect.top - menuH - 8;
      if (altTop > 8) top = altTop;
      else top = Math.max(8, window.innerHeight - menuH - 8);
    }
    // clamp top
    if (top < 8) top = 8;

    // apply corrected pos if changed
    if (left !== pos.left || top !== pos.top) {
      // small timeout ensures we don't conflict with layout thrash
      requestAnimationFrame(() =>
        setPos({ left: Math.round(left), top: Math.round(top) })
      );
    }
  }, [pos, anchorRef]);

  // outside click + escape to close + minimal focus trap
  useEffect(() => {
    function handleDown(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose && onClose();
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") onClose && onClose();
      if (e.key === "Tab") {
        const focusable = menuRef.current?.querySelectorAll(
          "button[role='menuitem']"
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isShift = e.shiftKey;
        if (document.activeElement === last && !isShift && e.key === "Tab") {
          e.preventDefault();
          first.focus();
        } else if (
          document.activeElement === first &&
          isShift &&
          e.key === "Tab"
        ) {
          e.preventDefault();
          last.focus();
        }
      }
    }
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("touchstart", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("touchstart", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, anchorRef]);

  // move focus into menu after mount
  useEffect(() => {
    const t = setTimeout(() => {
      const first = menuRef.current?.querySelector("button[role='menuitem']");
      if (first) first.focus();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!pos) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="more-menu more-menu--floating"
      role="menu"
      aria-label="More actions"
      style={{
        position: "fixed",
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        boxSizing: "border-box",
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            role="menuitem"
            className={`menu-item ${it.className || ""}`}
            onClick={(e) => {
              e.preventDefault();
              it.onClick && it.onClick();
            }}
            tabIndex={0}
          >
            {Icon && <Icon className="mi-icon" />}{" "}
            <span className="mi-label">{it.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}
