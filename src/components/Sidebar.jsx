import React from "react";
import { Folder, FileText, CornerLeftUp } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const { theme } = useUIStore();
  const { currentFolder, files, fileName, openFileFromSidebar } =
    useFileStore();

  if (!currentFolder) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {currentFolder.split(/[\\/]/).pop() || "Workspace"}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {files.map((file, i) => {
          const isDir = file.type === "DIRECTORY";
          const isBack = file.entry === "..";
          return (
            <div
              key={i}
              className={`file-item ${!isDir && fileName === file.entry ? "active" : ""}`}
              onClick={() => openFileFromSidebar(file)}
            >
              {isBack ? (
                <CornerLeftUp size={14} color="var(--accent)" />
              ) : isDir ? (
                <Folder
                  size={14}
                  color={theme === "light" ? "#ca8a04" : "#facc15"}
                />
              ) : (
                <FileText size={14} />
              )}
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: isDir && !isBack ? "var(--text-primary)" : "inherit",
                  fontWeight: isDir && !isBack ? 500 : 400,
                }}
              >
                {isBack ? "Go back" : file.entry}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
