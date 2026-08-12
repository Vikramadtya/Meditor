import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  FileText,
  CornerLeftUp,
  FilePlus,
  FolderPlus,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const { theme, isSidebarOpen, toggleSidebar } = useUIStore();
  const {
    currentFolder,
    files,
    fileName,
    openFileFromSidebar,
    createNewFile,
    createNewFolder,
  } = useFileStore();

  const [creatingType, setCreatingType] = useState(null); // 'file' | 'folder' | null
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);

  // Focus the input as soon as it appears
  useEffect(() => {
    if (creatingType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creatingType]);

  const handleNewFileClick = () => {
    setNewName("");
    setCreatingType("file");
  };

  const handleNewFolderClick = () => {
    setNewName("");
    setCreatingType("folder");
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreatingType(null);
      return;
    }

    const type = creatingType;
    setCreatingType(null);

    if (type === "file") {
      await createNewFile(trimmed);
    } else if (type === "folder") {
      await createNewFolder(trimmed);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") setCreatingType(null);
  };

  if (!currentFolder) return null;

  return (
    <div className={`sidebar ${isSidebarOpen ? "" : "closed"}`}>
      {/* Header row with workspace name + Action buttons */}
      <div className="sidebar-header">
        <span className="sidebar-workspace-name">
          {currentFolder.split(/[/\\]/).pop() || "Workspace"}
        </span>
        <div
          className="sidebar-actions"
          style={{ display: "flex", gap: "4px" }}
        >
          <button
            className="sidebar-new-file-btn"
            onClick={handleNewFileClick}
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            className="sidebar-new-file-btn"
            onClick={handleNewFolderClick}
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* Inline new file/folder input row */}
      {creatingType && (
        <div className="new-file-input-row">
          {creatingType === "folder" ? (
            <Folder
              size={13}
              style={{ flexShrink: 0, opacity: 0.5 }}
              color={theme === "light" ? "#ca8a04" : "#facc15"}
            />
          ) : (
            <FileText size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
          )}
          <input
            ref={inputRef}
            className="new-file-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleCreate}
            placeholder={
              creatingType === "folder" ? "folder_name" : "filename.md"
            }
            spellCheck={false}
          />
        </div>
      )}

      {/* File list */}
      <div className="file-list">
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
