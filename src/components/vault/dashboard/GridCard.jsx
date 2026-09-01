import React from "react";
import { Folder, FileText, Book } from "lucide-react";
import { useStore } from "../../../store/index";

export function GridCard({ child }) {
  const { setActiveVaultItem, openNoteFromVault } = useStore();
  const isNote = child.type === "note";
  const childCount = child.metadata?.children_order?.length || 0;

  return (
    <div
      onClick={() =>
        isNote ? openNoteFromVault(child) : setActiveVaultItem(child)
      }
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 15px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
      }}
    >
      <div
        style={{
          height: "120px",
          backgroundColor: "#3b82f6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Book
          size={90}
          style={{
            position: "absolute",
            bottom: "-15px",
            right: "10px",
            color: "rgba(255,255,255,0.2)",
            transform: "rotate(15deg)",
          }}
        />
      </div>
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          minHeight: "130px",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--text-primary)",
            lineHeight: "1.4",
          }}
        >
          {child.name}
        </div>
        <div style={{ marginTop: "16px" }}>
          <span
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {isNote ? "1 note" : `${childCount} items`}
          </span>
        </div>
      </div>
    </div>
  );
}
