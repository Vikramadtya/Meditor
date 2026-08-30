import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit3,
  FolderTree,
  List,
  Save,
  Search,
  Settings,
  Columns,
  Layers,
  Tag,
  Star,
  History,
} from "lucide-react";
import { useStore } from "../../store/index";
import {
  selectShowDashboard,
  selectIsVaultNote,
} from "../../store/selectors/index";
import { noteService } from "../../application/vault/NoteService";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository";

/** Small reusable FAB button with hover highlight */
function FabBtn({
  onClick,
  title,
  children,
  active = false,
  activeColor = "var(--accent)",
  extraStyle = {},
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.08)" : "transparent",
        border: "none",
        color: active ? activeColor : "var(--text-primary)",
        cursor: "pointer",
        padding: "6px 8px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s ease",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

/** Thin vertical separator */
function FabSep() {
  return (
    <div
      style={{
        width: "1px",
        background: "var(--glass-border)",
        margin: "0 2px",
        alignSelf: "stretch",
      }}
    />
  );
}

export default function FloatingActionBar() {
  const {
    isEditMode,
    toggleMode,
    toggleToc,
    setCmdPaletteOpen,
    setSettingsOpen,
    viewLayout,
    toggleLayout,
    setFlashcardModalOpen,
    saveActiveFile,
    openWorkspaceDialog,
    activeVaultItem,
    workspaceMode,
  } = useStore();

  const showDashboard = useStore(selectShowDashboard);
  const isVaultNote = useStore(selectIsVaultNote);

  const [isFavorite, setIsFavorite] = useState(false);

  // Sync favourite state when active note changes
  useEffect(() => {
    if (isVaultNote && activeVaultItem?.id) {
      try {
        setIsFavorite(vaultRepository.isFavorite(activeVaultItem.id));
      } catch {
        setIsFavorite(false);
      }
    } else {
      setIsFavorite(false);
    }
  }, [activeVaultItem?.id, isVaultNote]);

  const handleToggleFavorite = async () => {
    if (!activeVaultItem?.id) return;
    await noteService.toggleFavorite(activeVaultItem.id);
    setIsFavorite((prev) => !prev);
  };

  if (showDashboard) return null;

  return (
    <div className="fab">
      {/* Layout / view controls */}
      <FabBtn
        onClick={toggleLayout}
        title="Toggle Split View"
        active={viewLayout === "split"}
      >
        <Columns size={18} />
      </FabBtn>

      {viewLayout === "single" && (
        <FabBtn onClick={toggleMode} title="Toggle Mode (Cmd+E)">
          {isEditMode ? <Eye size={18} /> : <Edit3 size={18} />}
        </FabBtn>
      )}

      <FabSep />

      {/* Workspace open (folder mode only) */}
      {workspaceMode !== "vault" && (
        <FabBtn onClick={openWorkspaceDialog} title="Open Workspace">
          <FolderTree size={18} />
        </FabBtn>
      )}

      {/* Common note actions */}
      <FabBtn onClick={toggleToc} title="Table of Contents">
        <List size={18} />
      </FabBtn>
      <FabBtn onClick={saveActiveFile} title="Save File (Cmd+S)">
        <Save size={18} />
      </FabBtn>
      <FabBtn
        onClick={() => {
          const { setHistoryModalOpen } = useStore.getState();
          setHistoryModalOpen(true);
        }}
        title="Note History"
      >
        <History size={18} />
      </FabBtn>

      {/* Vault-note-specific actions */}
      {isVaultNote && (
        <>
          <FabSep />
          <FabBtn
            onClick={handleToggleFavorite}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            active={isFavorite}
            activeColor="#f59e0b"
          >
            <Star size={18} fill={isFavorite ? "#f59e0b" : "none"} />
          </FabBtn>
          <FabBtn
            onClick={() => setFlashcardModalOpen(true)}
            title="Active Recall Flashcard"
          >
            <Layers size={18} />
          </FabBtn>
        </>
      )}

      <FabSep />

      {/* Global actions */}
      <FabBtn
        onClick={() => setCmdPaletteOpen(true)}
        title="Command Palette (Cmd+K)"
      >
        <Search size={18} />
      </FabBtn>
      <FabBtn onClick={() => setSettingsOpen(true)} title="Settings">
        <Settings size={18} />
      </FabBtn>
    </div>
  );
}
