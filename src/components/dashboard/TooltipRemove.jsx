import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { FiTrash2, FiX } from "react-icons/fi";
import PropTypes from "prop-types";
import "../CSS/TooltipRemove.css"; // import CSS

export default function TooltipRemove({
  id,
  link,
  rect,
  onFinalize,
  onUndo,
  onClose,
}) {
  const root = typeof document !== "undefined" ? document.body : null;
  const [stage, setStage] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);
  const elRef = useRef(null);

  // pos holds the clamped position we render at
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const onResize = () => {};
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startPending = () => {
    if (stage === "pending") return;
    setStage("pending");
    const expires = Date.now() + 10000;
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
      setTimeLeft(left);
      if (Date.now() >= expires) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        finalizeNow();
      }
    }, 250);
  };

  const finalizeNow = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStage("idle");
    if (onFinalize) onFinalize(id);
    if (onClose) onClose();
  };

  const handleUndo = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStage("idle");
    if (onUndo) onUndo(id);
    if (onClose) onClose();
  };

  useEffect(() => {
    function onDocClick(e) {
      if (!elRef.current) return;
      if (!elRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!root || !rect) return null;

  const width = 150;
  const offsetLeft = 45; // anchor offset from center
  const padding = 8;
  // initial anchor position (preferred)
  const initialLeft = Math.max(
    padding,
    Math.min(
      rect.left + rect.width / 2 - width / 2 + offsetLeft,
      window.innerWidth - width - padding
    )
  );
  const initialTop = rect.top + 82; // prefer below the trigger

  // measure after mount and clamp to viewport while keeping anchor preference
  useLayoutEffect(() => {
    // set initial pos immediately so it doesn't flash at 0,0
    setPos({ left: initialLeft, top: initialTop });

    const adjust = () => {
      const el = elRef.current;
      if (!el) return;

      const elRect = el.getBoundingClientRect();

      // Horizontal clamping: keep near initialLeft but ensure inside viewport
      let newLeft = initialLeft;
      if (initialLeft < padding) newLeft = padding;
      if (initialLeft + elRect.width > window.innerWidth - padding) {
        newLeft = Math.max(padding, window.innerWidth - elRect.width - padding);
      }

      // Vertical positioning: prefer below (initialTop).
      // If bottom overflows, try placing above the trigger. If that also overflows, clamp.
      let newTop = initialTop;
      const bottomOverflow =
        initialTop + elRect.height > window.innerHeight - padding;
      if (bottomOverflow) {
        // try placing above the trigger rect
        const tryAbove = rect.top - elRect.height - 8; // small gap
        if (tryAbove >= padding) {
          newTop = tryAbove;
        } else {
          // clamp into viewport
          newTop = Math.max(
            padding,
            Math.min(window.innerHeight - elRect.height - padding, initialTop)
          );
        }
      }
      // If initialTop is too high (rare), clamp top as well
      if (newTop < padding) newTop = padding;
      if (newTop + elRect.height > window.innerHeight - padding) {
        newTop = Math.max(
          padding,
          window.innerHeight - elRect.height - padding
        );
      }

      // Only update if changed (avoid re-renders)
      setPos((prev) => {
        if (!prev || prev.left !== newLeft || prev.top !== newTop) {
          return { left: newLeft, top: newTop };
        }
        return prev;
      });
    };

    // adjust once after render
    adjust();

    // also adjust on resize/orientation change
    window.addEventListener("resize", adjust);
    window.addEventListener("orientationchange", adjust);
    return () => {
      window.removeEventListener("resize", adjust);
      window.removeEventListener("orientationchange", adjust);
    };
  }, [initialLeft, initialTop, rect]);

  // If pos still null (very rare), fallback to initial values
  const renderLeft = pos ? pos.left : initialLeft;
  const renderTop = pos ? pos.top : initialTop;

  return createPortal(
    <div
      ref={elRef}
      className="tooltip-remove"
      style={{
        position: "fixed",
        left: renderLeft,
        top: renderTop,
        width,
        zIndex: 2000,
        pointerEvents: "auto",
      }}
    >
      {stage === "idle" && (
        <div className="tooltip-remove__card">
          <button onClick={startPending} className="tooltip-remove__button">
            <FiTrash2 size={18} className="tooltip-remove__icon" />
            <span>Remove</span>
          </button>
        </div>
      )}

      {stage === "pending" && (
        <div className="tooltip-remove__pending">
          <div className="tooltip-remove__timer">
            <div className="tooltip-remove__time">{timeLeft}s</div>
          </div>

          <div className="tooltip-remove__actions">
            <button onClick={handleUndo} className="tooltip-remove__undo-btn">
              Undo
            </button>
            <button onClick={finalizeNow} className="tooltip-remove__close-btn">
              <FiX size={18} />
            </button>
          </div>
        </div>
      )}
    </div>,
    root
  );
}

TooltipRemove.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  link: PropTypes.object,
  rect: PropTypes.object,
  onFinalize: PropTypes.func,
  onUndo: PropTypes.func,
  onClose: PropTypes.func,
};
