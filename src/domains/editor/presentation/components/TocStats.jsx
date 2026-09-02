import React from "react";

export default function TocStats({
  stats,
  workspaceMode,
  activeVaultItem,
  setTagModalOpen,
}) {
  return (
    <>
      <div className="toc-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        DOCUMENT STATS
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {stats.words}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Words
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {stats.chars}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Characters
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {stats.readTime}m
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Read Time
          </div>
        </div>
      </div>

      <div
        className="toc-header"
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>TAGS ({stats.tags.length})</span>
        {workspaceMode === "vault" && activeVaultItem?.type === "note" && (
          <button
            onClick={() => setTagModalOpen(true)}
            style={{
              background: "rgba(128,128,128,0.1)",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
            }}
            title="Add tags & metadata"
          >
            + ADD
          </button>
        )}
      </div>

      {stats.tags.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "24px",
          }}
        >
          {stats.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "var(--text-primary)",
                color: "var(--bg-primary)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: workspaceMode === "vault" ? "pointer" : "default",
              }}
              onClick={() => workspaceMode === "vault" && setTagModalOpen(true)}
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : (
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: "13px",
            fontStyle: "italic",
            marginBottom: "24px",
          }}
        >
          No tags
        </div>
      )}
    </>
  );
}
