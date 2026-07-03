import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/tooltip.css";

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const iconRef = useRef(null);

  const updatePosition = () => {
    if (!iconRef.current) return;

    const rect = iconRef.current.getBoundingClientRect();

    const width = 260;

    let left = rect.left + rect.width / 2 - width / 2;

    if (left < 12) left = 12;

    if (left + width > window.innerWidth - 12) {
      left = window.innerWidth - width - 12;
    }

    setPosition({
      left,
      top: rect.bottom + window.scrollY + 10,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    const esc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", esc);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <>
      <button
        ref={iconRef}
        type="button"
        className="info-button"
        aria-label="Information"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(!open)}
      >
        ⓘ
      </button>

      {open &&
        createPortal(
          <div
            className="tooltip-box"
            style={{
              left: position.left,
              top: position.top,
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}