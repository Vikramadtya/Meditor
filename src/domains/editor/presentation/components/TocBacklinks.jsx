import React from "react";
import { openNoteByName } from "../../../../core/store/actions";

export default function TocBacklinks({ backlinks }) {
  return (
    <>
      <div className="toc-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        BACKLINKS ({backlinks.length})
      </div>
      {backlinks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {backlinks.map((link, i) => (
            <div
              key={i}
              className="toc-item"
              style={{
                padding: "6px 8px",
                background: "var(--bg-secondary)",
                borderRadius: "6px",
              }}
              onClick={() => openNoteByName(link.name)}
            >
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {link.name}
              </div>
              {link.snippet && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  {link.snippet}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: "13px",
            fontStyle: "italic",
          }}
        >
          No backlinks
        </div>
      )}
    </>
  );
}
