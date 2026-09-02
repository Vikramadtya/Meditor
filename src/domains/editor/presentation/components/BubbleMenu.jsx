import React from "react";
import { Bold, Italic, Strikethrough, Code, Link } from "lucide-react";
import { createPortal } from "react-dom";

/**
 * A floating bubble menu for text formatting that appears over text selection in the editor.
 * Uses React Portals to render at the document root level.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.show - Whether to show the menu.
 * @param {number} props.top - The top position in pixels.
 * @param {number} props.left - The left position in pixels.
 * @param {function} props.onFormat - Callback when a format button is clicked, passing prefix and suffix.
 * @returns {React.ReactPortal|null} The rendered BubbleMenu portal, or null if it shouldn't show.
 */
export default function BubbleMenu({ show, top, left, onFormat }) {
  if (!show) return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: `${top - 45}px`,
        // Float above the selection
        left: `${left}px`,
        transform: "translateX(-50%)",
        background: "var(--bg-glass)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "8px",
        padding: "4px",
        display: "flex",
        gap: "4px",
        zIndex: 9999,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        animation: "fadeUp 0.15s ease-out forwards",
      }}
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("**", "**");
        }}
        className="bubble-btn"
        style={btnStyle}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("*", "*");
        }}
        className="bubble-btn"
        style={btnStyle}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("~~", "~~");
        }}
        className="bubble-btn"
        style={btnStyle}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <div
        style={{
          width: "1px",
          background: "var(--glass-border)",
          margin: "4px 2px",
        }}
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("`", "`");
        }}
        className="bubble-btn"
        style={btnStyle}
        title="Inline Code"
      >
        <Code size={16} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("[", "](url)");
        }}
        className="bubble-btn"
        style={btnStyle}
        title="Link"
      >
        <Link size={16} />
      </button>
    </div>,
    document.body,
  );
}
const btnStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
};

// Added hover effect via a small inline style tag since it's a portal component
document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
    .bubble-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
  </style>`,
);
