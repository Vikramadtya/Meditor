import React from "react";
import { useUIStore } from "../store/uiStore";

export default function TableOfContents({ toc }) {
  const { isTocOpen } = useUIStore();

  if (!isTocOpen) return null;

  const handleScroll = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="toc-sidebar">
      <div className="toc-header">Table of Contents</div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {toc.length > 0 ? (
          toc.map((heading, i) => (
            <div
              key={i}
              onClick={() => handleScroll(heading.id)}
              className={`toc-item level-${heading.level}`}
              title={heading.text}
            >
              {heading.text}
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "16px",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            No headings found.
          </div>
        )}
      </div>
    </div>
  );
}
