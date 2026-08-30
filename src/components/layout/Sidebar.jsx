import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  FileText,
  CornerLeftUp,
  FilePlus,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Plus,
  Database,
  Trash2,
  Tag,
} from "lucide-react";
import { useStore } from "../../store/index";

import { vaultService } from "../../application/vault/VaultService";
import { tagService } from "../../services/tagService";
import { linkService } from "../../services/linkService";
import VaultSidebar from "../vault/VaultSidebar";
import "../../styles/Sidebar.css";

export default function Sidebar() {
  const { theme, isSidebarOpen, openCreateVaultItemModal } = useStore();
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const isDragging = useRef(false);
  const {
    workspaceMode,
    currentFolder,
    files,
    vaultHierarchy,
    openFileFromSidebar,
    openNoteFromVault,
    createNewFile,
    createNewFolder,
    reloadVaultHierarchy,
  } = useStore();

  const [activeTab, setActiveTab] = useState("files"); // "files" or "tags"
  const [creatingType, setCreatingType] = useState(null);
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);

  const [tags, setTags] = useState({});

  useEffect(() => {
    if (creatingType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creatingType]);

  useEffect(() => {
    if (activeTab === "tags") {
      tagService.getAllTags().then((t) => setTags(t));
    }
  }, [activeTab, currentFolder]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setSidebarWidth(Math.max(150, Math.min(e.clientX, 600)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (workspaceMode === "vault") {
    return (
      <div
        className={`sidebar ${isSidebarOpen ? "" : "closed"}`}
        style={
          isSidebarOpen
            ? {
                width: `${sidebarWidth}px`,
                flexShrink: 0,
                position: "relative",
              }
            : {}
        }
      >
        <VaultSidebar />
        {isSidebarOpen && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "4px",
              height: "100%",
              cursor: "col-resize",
              zIndex: 10,
            }}
          />
        )}
      </div>
    );
  }

  // --- Folder Mode Handlers ---
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

    if (workspaceMode === "folder") {
      if (type === "file") await createNewFile(trimmed);
      else if (type === "folder") await createNewFolder(trimmed);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") {
      setCreatingType(null);
    }
  };

  const handleDeleteVaultItem = async (type, id) => {
    if (confirm(`Delete this ${type} and all its contents?`)) {
      await vaultService.deleteItem(type, id);
      reloadVaultHierarchy();
    }
  };

  if (!currentFolder) return null;

  return (
    <div
      className={`sidebar ${isSidebarOpen ? "" : "closed"}`}
      style={
        isSidebarOpen
          ? { width: `${sidebarWidth}px`, flexShrink: 0, position: "relative" }
          : {}
      }
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
          <span
            className="sidebar-workspace-name"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {workspaceMode === "vault" ? (
              <Database size={14} color="var(--accent)" />
            ) : null}
            {currentFolder.split(/[/\\]/).pop() || "Workspace"}
          </span>

          {workspaceMode === "folder" ? (
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
          ) : (
            <div
              className="sidebar-actions"
              style={{ display: "flex", gap: "4px" }}
            >
              <button
                className="sidebar-new-file-btn"
                onClick={() => openCreateVaultItemModal("group", null)}
                title="New Group"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--glass-border)",
            paddingBottom: "0px",
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "8px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "files"
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              color:
                activeTab === "files"
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
            onClick={() => setActiveTab("files")}
          >
            Explorer
          </button>
          <button
            style={{
              flex: 1,
              padding: "8px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "tags"
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              color:
                activeTab === "tags"
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
            onClick={() => setActiveTab("tags")}
          >
            Tags
          </button>
        </div>
      </div>

      {creatingType && workspaceMode === "folder" && activeTab === "files" && (
        <div className="new-file-input-row" style={{ marginTop: "10px" }}>
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

      <div className="file-list" style={{ paddingTop: "10px" }}>
        {activeTab === "files" &&
          workspaceMode === "folder" &&
          files.map((file, i) => {
            const isDir = file.type === "DIRECTORY";
            const isBack = file.entry === "..";
            return (
              <div
                key={i}
                className="file-item"
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

        {activeTab === "files" &&
          workspaceMode === "vault" &&
          vaultHierarchy.map((g) => (
            <VaultNode
              key={g.id}
              item={g}
              level={0}
              theme={theme}
              onAdd={(type) => openCreateVaultItemModal(type, g.id)}
              onDelete={() => handleDeleteVaultItem(g.type, g.id)}
              onOpen={(note) => openNoteFromVault(note)}
            />
          ))}

        {activeTab === "tags" &&
          (Object.keys(tags).length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "12px",
              }}
            >
              No tags found in markdown files.
            </div>
          ) : (
            Object.keys(tags)
              .sort()
              .map((tag) => <TagNode key={tag} tag={tag} notes={tags[tag]} />)
          ))}
      </div>
      {isSidebarOpen && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "4px",
            height: "100%",
            cursor: "col-resize",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}

function TagNode({ tag, notes }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        className="file-item vault-item"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Tag
          size={13}
          style={{
            marginLeft: "4px",
            marginRight: "6px",
            color: "var(--accent)",
          }}
        />
        <span
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: 500,
          }}
        >
          {tag}{" "}
          <span style={{ opacity: 0.5, fontSize: "11px" }}>
            ({notes.length})
          </span>
        </span>
      </div>

      {expanded && (
        <div className="vault-children" style={{ paddingLeft: "24px" }}>
          {notes.map((note) => (
            <div
              key={note.path}
              className="file-item"
              onClick={() => linkService.openNoteByName(note.name)}
            >
              <FileText size={13} />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {note.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VaultNode({ item, level, theme, onAdd, onDelete, onOpen }) {
  const [expanded, setExpanded] = useState(true);
  const isNote = item.type === "note";
  const { openCreateVaultItemModal } = useStore();
  const { setActiveVaultItem } = useStore();

  const getNextType = (current) => {
    if (current === "group") return "collection";
    if (current === "collection") return "module";
    if (current === "module") return "note";
    return null;
  };

  const nextType = getNextType(item.type);

  return (
    <div
      style={{
        paddingLeft: level * 12 + "px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="file-item vault-item"
        onClick={() => {
          setActiveVaultItem(item);
          if (isNote) onOpen(item);
          else setExpanded(!expanded);
        }}
      >
        {!isNote ? (
          expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : (
          <FileText size={14} style={{ marginLeft: "14px" }} />
        )}

        <span
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </span>

        <div className="vault-item-actions">
          {nextType && (
            <button
              className="sidebar-new-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
                openCreateVaultItemModal(nextType, item.id);
              }}
              title={`New ${nextType}`}
            >
              <Plus size={12} />
            </button>
          )}
          <button
            className="sidebar-new-file-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && item.children && (
        <div className="vault-children">
          {item.children.map((child) => (
            <VaultNode
              key={child.id}
              item={child}
              level={level + 1}
              theme={theme}
              onAdd={onAdd}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
