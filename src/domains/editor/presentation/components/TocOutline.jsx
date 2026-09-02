import React from "react";

export default function TocOutline({ toc, handleScroll }) {
  return (
    <>
      <div className="toc-header">TABLE OF CONTENTS</div>
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
    </>
  );
}
