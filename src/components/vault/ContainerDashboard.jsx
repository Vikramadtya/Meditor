import React, { useState, useEffect } from "react";
import { Folder, Book, LayoutGrid, List } from "lucide-react";
import { GridCard } from "./dashboard/GridCard";
import { TocView } from "./dashboard/TocView";
import { useStore } from "../../store/index";
import { vaultService } from "../../application/vault/VaultService";

export default function ContainerDashboard() {
  const { activeVaultItem, setActiveVaultItem, openNoteFromVault } = useStore();
  const [children, setChildren] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'toc'

  useEffect(() => {
    if (activeVaultItem && activeVaultItem.type === "container") {
      vaultService.getFolderContents(activeVaultItem.path).then(setChildren);
    }
  }, [activeVaultItem]);

  if (!activeVaultItem) return null;

  return (
    <div
      style={{
        padding: "40px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Book size={32} style={{ color: "var(--accent)" }} />
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              {activeVaultItem.name}
            </h1>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginTop: "4px",
              }}
            >
              Your collection of {children.length} items.
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div
          style={{
            display: "flex",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            padding: "4px",
          }}
        >
          <div
            onClick={() => setViewMode("grid")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
              backgroundColor:
                viewMode === "grid" ? "var(--bg-primary)" : "transparent",
              color:
                viewMode === "grid"
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              boxShadow:
                viewMode === "grid" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            }}
          >
            <LayoutGrid size={16} /> Grid
          </div>
          <div
            onClick={() => setViewMode("toc")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
              backgroundColor:
                viewMode === "toc" ? "var(--bg-primary)" : "transparent",
              color:
                viewMode === "toc"
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              boxShadow:
                viewMode === "toc" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            }}
          >
            <List size={16} /> TOC
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {children.map((child) => (
            <GridCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <TocView children={children} />
      )}

      {children.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginTop: "100px",
          }}
        >
          <Folder size={48} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
          <h3>This folder is empty</h3>
          <p>Create a note or subfolder from the sidebar to get started.</p>
        </div>
      )}
    </div>
  );
}
