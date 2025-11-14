import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react";
import { FiX, FiZap } from "react-icons/fi";
import "../CSS/CustomTags.css";
import { Icon } from "@iconify/react";
import UrlContext from "../../context/url_manager/UrlContext";

export default function CustomTags({
  tags: initialTags = [],
  selected: initialSelected = null,
  inputFocus,
  onChange = () => {},
  onSelectChange = () => {},
  allowAdd = true,
  placeholder = "Add tag",
  showDropdown,
  setShowDropdown,
  disabledTags = [],
  setDisabledTags,
}) {
  const { setSearch, filtered, userTags } = useContext(UrlContext);
  const QUICK_ID = "__quick";

  const inputRef = useRef(null);

  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState(initialSelected || null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  // carousel state
  const trackRef = useRef(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const [slideIndex, setSlideIndex] = useState(0);

  // Normalize function: convert various incoming shapes into { id, label, icon }
  const normalizeSourceTags = (source = []) => {
    return (source || []).map((t, idx) => {
      // If already in { id, label, icon } shape, keep
      if (
        t &&
        typeof t === "object" &&
        ("label" in t || "tag" in t || "name" in t)
      ) {
        return {
          id:
            t.id ??
            t._id ??
            `t-${idx}-${String(t.tag ?? t.label ?? t.name ?? "").replace(
              /\s+/g,
              "-"
            )}`,
          label: (t.label ?? t.tag ?? t.name ?? "").toString(),
          icon: t.icon ?? null,
        };
      }
      // primitive (string) case
      return {
        id: `t-${idx}-${String(t).replace(/\s+/g, "-")}`,
        label: String(t),
        icon: null,
      };
    });
  };

  // ✅ Load from localStorage ONCE
  useEffect(() => {
    let storedDisabled = [];
    try {
      storedDisabled =
        JSON.parse(localStorage.getItem("lynkr_disabled_tags")) || [];
    } catch {
      storedDisabled = [];
    }

    if (typeof setDisabledTags === "function") setDisabledTags(storedDisabled);

    // Prefer userTags when present and non-empty, otherwise use initialTags
    const source =
      Array.isArray(userTags) && userTags.length ? userTags : initialTags;
    const normalized = normalizeSourceTags(source);

    // filter out disabled by id
    const filteredTags = normalized.filter(
      (t) => !storedDisabled.some((d) => d.id === t.id)
    );

    setTags(filteredTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ✅ Merge when initialTags or userTags change
  useEffect(() => {
    const source =
      Array.isArray(userTags) && userTags.length ? userTags : initialTags;
    const normalized = normalizeSourceTags(source);

    if (!normalized.length) {
      setTags([]);
      return;
    }

    const filteredTags = normalized.filter(
      (t) => !disabledTags.some((d) => d.id === t.id)
    );
    setTags(filteredTags);
  }, [initialTags, disabledTags, userTags]);

  // ✅ sync disabled tags
  useEffect(() => {
    try {
      localStorage.setItem("lynkr_disabled_tags", JSON.stringify(disabledTags));
    } catch (err) {
      console.warn("Failed to write disabled tags:", err);
    }
  }, [disabledTags]);

  // Count quick links
  const quickLinksCount = Array.isArray(filtered)
    ? filtered.filter((item) => item?.tags?.includes?.("#quicklink")).length
    : 0;

  // Icon resolver — kept unchanged
  const getIconForLabel = (label = "") => {
    const key = (label || "").trim().toLowerCase();
    switch (key) {
      case "work":
        return <Icon icon="fluent:briefcase-24-filled" width="18" />;
      case "research":
        return <Icon icon="mdi:microscope" width="18" />;
      case "education":
        return <Icon icon="mdi:school" width="18" />;
      case "ai":
        return <Icon icon="noto:robot" width="18" />;
      case "reading":
        return <Icon icon="flat-color-icons:reading" width="18" />;
      default:
        return <Icon icon="ph:plus-circle-fill" width="18" />;
    }
  };

  // Add new tag
  const addTag = (label) => {
    const trimmed = (label || "").trim();
    if (!trimmed) return;

    // Avoid duplicates or re-adding disabled tag
    if (
      tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase()) ||
      disabledTags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      setValue("");
      setEditing(false);
      return;
    }

    const newTag = { id: `t-${Date.now()}`, label: trimmed, icon: null };
    const next = [...tags, newTag];
    setTags(next);
    onChange(next);
    setValue("");
    setEditing(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // Remove tag permanently (add to disabled)
  const removeTag = (id) => {
    const tagToRemove = tags.find((t) => t.id === id);
    if (!tagToRemove) return;

    const nextVisible = tags.filter((t) => t.id !== id);
    const nextDisabled = [
      ...disabledTags.filter((d) => d.id !== tagToRemove.id),
      { id: tagToRemove.id, label: tagToRemove.label },
    ];

    setTags(nextVisible);
    if (typeof setDisabledTags === "function") setDisabledTags(nextDisabled);
    onChange(nextVisible);

    if (selected === id) {
      setSelected(null);
      onSelectChange(null);
      setSearch("");
    }

    try {
      localStorage.setItem("lynkr_disabled_tags", JSON.stringify(nextDisabled));
    } catch {}
  };

  // Re-enable tag
  const enableTag = (id) => {
    const tagToEnable = disabledTags.find((t) => t.id === id);
    if (!tagToEnable) return;

    const nextDisabled = disabledTags.filter((t) => t.id !== id);
    const nextTags = [...tags, tagToEnable];

    setTags(nextTags);
    if (typeof setDisabledTags === "function") setDisabledTags(nextDisabled);
    onChange(nextTags);
    setShowDropdown(false);
    try {
      localStorage.setItem("lynkr_disabled_tags", JSON.stringify(nextDisabled));
    } catch {}
  };

  // Tag selection
  const toggleSelect = (id) => {
    const next = selected === id ? null : id;
    setSelected(next);
    onSelectChange(next);

    if (next === QUICK_ID) setSearch("#quicklink");
    else if (next) {
      const selectedTag = tags.find((t) => t.id === next);
      setSearch(selectedTag ? `#${selectedTag.label}` : "");
    } else setSearch("");
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(value);
    } else if (e.key === "Escape") {
      setEditing(false);
      setValue("");
    }
  };

  // ------------------------------
  // Carousel: compute slides for non-quick tags
  // ------------------------------
  const otherTags = useMemo(() => {
    return Array.isArray(tags) ? tags.slice() : [];
  }, [tags]);

  // responsive items per slide: prefer 4 but reduce on small widths
  useLayoutEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w <= 380) return 3;
      if (w <= 480) return 4;
      if (w <= 920) return 3;
      if (w >= 1120) return 5;
      return 4;
    };
    const apply = () => setItemsPerSlide(compute());
    apply();
    window.addEventListener("resize", apply, { passive: true });
    return () => window.removeEventListener("resize", apply);
  }, []);

  // build slides
  const slides = useMemo(() => {
    const out = [];
    if (!otherTags.length) return [[]];
    for (let i = 0; i < otherTags.length; i += itemsPerSlide) {
      out.push(otherTags.slice(i, i + itemsPerSlide));
    }
    return out.length ? out : [[]];
  }, [otherTags, itemsPerSlide]);

  // reset slide index when slides change length
  useEffect(() => {
    if (slideIndex >= slides.length)
      setSlideIndex(Math.max(0, slides.length - 1));
  }, [slides.length]);

  // scroll track to slide
  const scrollToSlide = (i) => {
    const idx = Math.max(0, Math.min(i, slides.length - 1));
    setSlideIndex(idx);
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.clientWidth || 1;
    track.scrollTo({ left: idx * slideWidth, behavior: "smooth" });
  };

  // convert vertical wheel to horizontal inside carousel
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    function onWheel(e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        node.scrollBy({ left: e.deltaY, behavior: "auto" });
      }
    }
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  // update slideIndex from scroll
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    let raf;
    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slideWidth = node.clientWidth || 1;
        const calculated = Math.round(node.scrollLeft / slideWidth);
        setSlideIndex((prev) => (prev === calculated ? prev : calculated));
      });
    }
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div
      className={`ct-tags-wrap ${inputFocus ? "focus" : ""}`}
      role="group"
      aria-label="Custom tags"
    >
      <div className="ct-tags">
        {/* Quick Add */}
        <button
          type="button"
          className={`ct-pill ct-pill-quick ${
            selected === QUICK_ID ? "selected" : ""
          }`}
          onClick={() => toggleSelect(QUICK_ID)}
        >
          <span className="ct-pill-left flash-icon">
            <FiZap className="ct-pill-icon" />
          </span>
          <span className="ct-pill-label">
            Quick <span className="ct-pill-count">{quickLinksCount}</span>
          </span>
        </button>

        {/* Carousel for other tags */}
        <div className="ct-carousel-wrap">
          <div
            className="ct-carousel-viewport"
            ref={trackRef}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
          >
            {slides.map((slideItems, sIdx) => (
              <section
                key={`ct-slide-${sIdx}`}
                className="ct-carousel-slide"
                aria-roledescription="slide"
                aria-label={`Slide ${sIdx + 1} of ${slides.length}`}
                data-slide-index={sIdx}
              >
                <div className="ct-carousel-grid" role="list">
                  {slideItems.length === 0 ? (
                    <div className="ct-carousel-empty">No tags</div>
                  ) : (
                    slideItems.map((t) => {
                      const isSelected = selected === t.id;
                      const icon = t.icon || getIconForLabel(t.label);
                      return (
                        <div
                          key={t.id}
                          id={`${t.label}`}
                          className={`ct-pill ${isSelected ? "selected" : ""}`}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleSelect(t.id)}
                        >
                          <div className="flex items-center justify-center">
                            <span className="ct-pill-left">{icon}</span>
                            <span className="ct-pill-label">{t.label}</span>
                          </div>

                          <button
                            type="button"
                            className="ct-remove-btn"
                            aria-label={`Remove ${t.label}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag(t.id);
                            }}
                          >
                            <FiX />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Dots only (no arrow buttons) */}
          {slides.length > 1 && (
            <div
              className="ct-carousel-dots"
              role="tablist"
              aria-label="Tag slides"
            >
              {slides.map((_, i) => (
                <button
                  key={`ct-dot-${i}`}
                  className={`ct-dot ${i === slideIndex ? "active" : ""}`}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === slideIndex ? "true" : "false"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Input */}
        {allowAdd && editing && (
          <div className="ct-input-pill">
            <input
              ref={inputRef}
              className="ct-input"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleInputKey}
              onBlur={() => {
                if (value.trim()) addTag(value);
                else {
                  setEditing(false);
                  setValue("");
                }
              }}
            />
          </div>
        )}

        {/* Add more / disabled dropdown (kept commented as in your original) */}
        <div className="ct-add-more">
          {/* placeholder for your dropdown trigger */}
        </div>
      </div>
    </div>
  );
}
