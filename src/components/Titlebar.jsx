import React, { useMemo } from "react";
import { FileText, PanelLeft, PanelLeftClose } from "lucide-react";
import { useFileStore } from "../store/fileStore";
import { useUIStore } from "../store/uiStore";

export default function Titlebar() {
  const { fileName, markdown, isDirty } = useFileStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200);
    return { words, chars, readTime };
  }, [markdown]);

  return (
    <div className="titlebar">
      <div
        className="titlebar-content"
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          paddingRight: "16px",
        }}
      >
        {/* File name + unsaved indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={toggleSidebar}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "2px",
              marginLeft: "70px", // space for macOS window controls
            }}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={14} />
            ) : (
              <PanelLeft size={14} />
            )}
          </button>

          <FileText size={14} />
          <span>{fileName}</span>
          {isDirty && (
            <span
              title="Unsaved changes — press Cmd+S to save"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                flexShrink: 0,
                boxShadow: "0 0 6px var(--accent)",
              }}
            />
          )}
          <span style={{ color: "var(--text-secondary)", opacity: 0.4 }}>
            — meditor
          </span>
        </div>

        {/* Doc stats */}
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-secondary)",
            display: "flex",
            gap: "12px",
          }}
        >
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span>{stats.readTime} min read</span>
        </div>
      </div>
    </div>
  );
}
