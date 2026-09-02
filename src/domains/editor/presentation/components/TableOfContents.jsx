import React from "react";
import { useTableOfContents } from "../hooks/useTableOfContents";
import TocOutline from "./TocOutline";
import TocStats from "./TocStats";
import TocBacklinks from "./TocBacklinks";

export default function TableOfContents({ toc }) {
  const {
    isTocOpen,
    activeTab,
    setActiveTab,
    backlinks,
    stats,
    handleScroll,
    setTagModalOpen,
    workspaceMode,
    activeVaultItem,
  } = useTableOfContents();

  if (!isTocOpen) return null;

  return (
    <div className="toc-sidebar">
      <div style={{ display: "flex", padding: "16px", gap: "8px" }}>
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            flex: 1,
            padding: "6px",
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "6px",
            background:
              activeTab === "stats" ? "var(--bg-secondary)" : "transparent",
            color:
              activeTab === "stats"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            border: "1px solid",
            borderColor:
              activeTab === "stats" ? "var(--glass-border)" : "transparent",
            cursor: "pointer",
          }}
        >
          STATS
        </button>
        <button
          onClick={() => setActiveTab("outline")}
          style={{
            flex: 1,
            padding: "6px",
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "6px",
            background:
              activeTab === "outline" ? "var(--bg-secondary)" : "transparent",
            color:
              activeTab === "outline"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            border: "1px solid",
            borderColor:
              activeTab === "outline" ? "var(--glass-border)" : "transparent",
            cursor: "pointer",
          }}
        >
          OUTLINE
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "outline" ? (
          <TocOutline toc={toc} handleScroll={handleScroll} />
        ) : (
          <div style={{ padding: "0 16px" }}>
            <TocStats
              stats={stats}
              workspaceMode={workspaceMode}
              activeVaultItem={activeVaultItem}
              setTagModalOpen={setTagModalOpen}
            />
            <TocBacklinks backlinks={backlinks} />
          </div>
        )}
      </div>
    </div>
  );
}
