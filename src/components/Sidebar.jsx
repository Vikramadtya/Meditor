import React, { useState, useRef, useEffect } from "react";
import { Folder, FileText, CornerLeftUp, FilePlus } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const { theme } = useUIStore();
  const { currentFolder, files, fileName, openFileFromSidebar, createNewFile } =
    useFileStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const inputRef = useRef(null);

  // Focus the input as soon as it appears
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleNewFileClick = () => {
    setNewFileName("");
    setIsCreating(true);
  };

  const handleCreate = async () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    setIsCreating(false);
    await createNewFile(trimmed);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") setIsCreating(false);
  };

  if (!currentFolder) return null;

  return (
    <div className="sidebar">
      {/* Header row with workspace name + New File button */}
      <div className="sidebar-header">
        <span className="sidebar-workspace-name">
          {currentFolder.split(/[/\\]/).pop() || "Workspace"}
        </span>
        <button
          className="sidebar-new-file-btn"
          onClick={handleNewFileClick}
          title="New File"
        >
          <FilePlus size={14} />
        </button>
      </div>

      {/* Inline new-file input row */}
      {isCreating && (
        <div className="new-file-input-row">
          <FileText size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
          <input
            ref={inputRef}
            className="new-file-input"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleCreate}
            placeholder="filename.md"
            spellCheck={false}
          />
        </div>
      )}

      {/* File list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {files.map((file, i) => {
          const isDir = file.type === "DIRECTORY";
          const isBack = file.entry === "..";
          const isActive = !isDir && fileName === file.entry;
          return (
            <div
              key={i}
              className={`file-item ${isActive ? "active" : ""}`}
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
