import { useShallow } from "zustand/react/shallow";
import {
  saveActiveFile,
  openWorkspaceDialog,
} from "../../../../core/store/actions.js";
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
  Star,
  History,
} from "lucide-react";
import { useStore } from "../../../../core/store/index";
import { selectIsVaultNote } from "../../../vault/store/vault.selectors";
import { noteService } from "../../../vault/application/NoteService";
import { vaultRepository } from "../../../vault/infrastructure/SqliteVaultRepository";

/**
 * A reusable floating action button component.
 *
 * @param {Object} props - The component props.
 * @param {function} props.onClick - Click handler.
 * @param {string} props.title - Tooltip title.
 * @param {React.ReactNode} props.children - Icon or content.
 * @param {boolean} [props.active=false] - Whether the button is in an active state.
 * @param {string} [props.activeColor="var(--accent)"] - Color when active.
 * @param {Object} [props.extraStyle={}] - Additional inline styles.
 * @returns {React.ReactElement} The rendered button component.
 */
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

/**
 * A separator for the floating action bar.
 *
 * @returns {React.ReactElement} The rendered separator component.
 */
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

/**
 * Group of editor-specific actions for the floating action bar.
 *
 * @returns {React.ReactElement} The rendered fragment of editor actions.
 */
function EditorActions() {
  const {
    isEditMode,
    toggleMode,
    toggleToc,
    viewLayout,
    toggleLayout,
    workspaceMode,
  } = useStore(
    useShallow((s) => ({
      isEditMode: s.isEditMode,
      toggleMode: s.toggleMode,
      toggleToc: s.toggleToc,
      viewLayout: s.viewLayout,
      toggleLayout: s.toggleLayout,
      workspaceMode: s.workspaceMode,
    })),
  );
  return (
    <>
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
      {workspaceMode !== "vault" && (
        <FabBtn onClick={openWorkspaceDialog} title="Open Workspace">
          <FolderTree size={18} />
        </FabBtn>
      )}
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
    </>
  );
}

/**
 * Group of vault-specific actions for the floating action bar.
 *
 * @returns {React.ReactElement} The rendered fragment of vault note actions.
 */
function VaultNoteActions() {
  const { activeVaultItem } = useStore(
    useShallow((s) => ({
      activeVaultItem: s.activeVaultItem,
    })),
  );
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    if (activeVaultItem?.id) {
      try {
        setIsFavorite(vaultRepository.isFavorite(activeVaultItem.id));
      } catch {
        setIsFavorite(false);
      }
    } else {
      setIsFavorite(false);
    }
  }, [activeVaultItem?.id]);
  const handleToggleFavorite = async () => {
    if (!activeVaultItem?.id) return;
    await noteService.toggleFavorite(activeVaultItem.id);
    setIsFavorite((prev) => !prev);
  };
  return (
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
    </>
  );
}

/**
 * A floating action bar that provides quick access to common actions and settings.
 * Renders editor, vault (if applicable), and global actions.
 *
 * @returns {React.ReactElement} The rendered FloatingActionBar component.
 */
export default function FloatingActionBar() {
  const { setCmdPaletteOpen, setSettingsOpen } = useStore(
    useShallow((s) => ({
      setCmdPaletteOpen: s.setCmdPaletteOpen,
      setSettingsOpen: s.setSettingsOpen,
    })),
  );
  const isVaultNote = useStore(selectIsVaultNote);
  return (
    <div className="fab">
      <EditorActions />
      {isVaultNote && <VaultNoteActions />}

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
