import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { useFileStore } from "../store/fileStore";

export default function Titlebar() {
  const { fileName, markdown } = useFileStore();

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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={14} />
          {fileName} - meditor
        </div>
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
