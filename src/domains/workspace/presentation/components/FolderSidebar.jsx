import { useShallow } from "zustand/react/shallow";
import {
  createNewFile,
  createNewFolder,
} from "../../../../store/actions/index";
import React, { useState, useRef, useEffect } from "react";
import { Folder, FileText, FilePlus, FolderPlus } from "lucide-react";
import { useStore } from "../../../../core/store/index";
import { FileTree } from "./FileTree";

/**
 * A sidebar for navigating regular file system folders (non-vault mode).
 * Allows creating new files and folders, and displays the file tree.
 *
 * @returns {React.ReactElement|null} The rendered FolderSidebar component, or null if no folder is active.
 */
export default function FolderSidebar() {
  const { theme, currentFolder, files, workspaceMode, workspaceRoot } =
    useStore(
      useShallow((s) => ({
        theme: s.theme,
        currentFolder: s.currentFolder,
        files: s.files,
        workspaceMode: s.workspaceMode,
        workspaceRoot: s.workspaceRoot,
      })),
    );
  const [creatingType, setCreatingType] = useState(null);
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (creatingType && inputRef.current) inputRef.current.focus();
  }, [creatingType]);
  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreatingType(null);
      return;
    }
    const type = creatingType;
    setCreatingType(null);
    if (type === "file") await createNewFile(trimmed);
    else if (type === "folder") await createNewFolder(trimmed);
  };
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") setCreatingType(null);
  };
  if (!currentFolder) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        className="sidebar-header"
        style={{
          paddingBottom: 0,
          flexDirection: "column",
          alignItems: "stretch",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="sidebar-workspace-name">
            {currentFolder.split(/[/\\]/).pop() || "Workspace"}
          </span>
          <div
            className="sidebar-actions"
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
            <button
              className="sidebar-new-file-btn"
              onClick={() => {
                setNewName("");
                setCreatingType("file");
              }}
              title="New File"
            >
              <FilePlus size={14} />
            </button>
            <button
              className="sidebar-new-file-btn"
              onClick={() => {
                setNewName("");
                setCreatingType("folder");
              }}
              title="New Folder"
            >
              <FolderPlus size={14} />
            </button>
          </div>
        </div>
      </div>

      {creatingType && (
        <div
          className="new-file-input-row"
          style={{
            marginTop: "10px",
            padding: "0 10px",
          }}
        >
          {creatingType === "folder" ? (
            <Folder
              size={13}
              style={{
                flexShrink: 0,
                opacity: 0.5,
              }}
              color={theme === "light" ? "#ca8a04" : "#facc15"}
            />
          ) : (
            <FileText
              size={13}
              style={{
                flexShrink: 0,
                opacity: 0.5,
              }}
            />
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

      <div
        className="file-list"
        style={{
          paddingTop: "10px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <FileTree
          files={
            currentFolder !== workspaceRoot
              ? [
                  {
                    entry: "..",
                    type: "DIRECTORY",
                  },
                  ...files.filter((f) => f.entry !== ".."),
                ]
              : files
          }
        />
      </div>
    </div>
  );
}
