import { useShallow } from "zustand/react/shallow";
import {
  openNoteFromVault,
  saveActiveFile,
  openWorkspaceDialog,
  createVaultDialog,
  createNewFile,
  createNewFolder,
} from "../../../../store/actions/index.js";
import React, { useState } from "react";
import {
  Eye,
  Edit3,
  FolderOpen,
  Sun,
  Moon,
  Save,
  List,
  Settings,
  Search,
  FileCode,
  FileText,
} from "lucide-react";
import { useStore } from "../../../../core/store/index";
import { exportService } from "../../../editor/application/ExportService";
import { vaultRepository } from "../../../vault/infrastructure/SqliteVaultRepository";

/**
 * Global command palette accessible via keyboard shortcut (Cmd+K).
 * Allows searching vault notes and executing application commands.
 *
 * @returns {React.ReactElement} The rendered CommandPalette modal component.
 */
export default function CommandPalette() {
  const {
    isCmdPaletteOpen,
    setCmdPaletteOpen,
    isEditMode,
    toggleMode,
    theme,
    setTheme,
    toggleToc,
    setSettingsOpen,
    workspaceMode,
  } = useStore(
    useShallow((s) => ({
      isCmdPaletteOpen: s.isCmdPaletteOpen,
      setCmdPaletteOpen: s.setCmdPaletteOpen,
      isEditMode: s.isEditMode,
      toggleMode: s.toggleMode,
      theme: s.theme,
      setTheme: s.setTheme,
      toggleToc: s.toggleToc,
      setSettingsOpen: s.setSettingsOpen,
      workspaceMode: s.workspaceMode,
    })),
  );
  const [cmdSearch, setCmdSearch] = useState("");
  const [noteResults, setNoteResults] = useState([]);
  React.useEffect(() => {
    if (
      isCmdPaletteOpen &&
      workspaceMode === "vault" &&
      cmdSearch.trim().length > 0
    ) {
      setNoteResults(vaultRepository.searchNotes(cmdSearch, 10));
    } else {
      setNoteResults([]);
    }
  }, [cmdSearch, isCmdPaletteOpen, workspaceMode]);
  const cmdActions = [
    {
      name: "Toggle Edit/View Mode",
      icon: isEditMode ? <Eye size={16} /> : <Edit3 size={16} />,
      action: () => {
        toggleMode();
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Open Workspace Folder",
      icon: <FolderOpen size={16} />,
      action: () => {
        openWorkspaceDialog();
        setCmdPaletteOpen(false);
      },
      hideInVault: true,
    },
    {
      name: "Create New Vault",
      icon: <FolderOpen size={16} />,
      action: () => {
        createVaultDialog();
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Toggle Theme (Dark/Light)",
      icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Save File",
      icon: <Save size={16} />,
      action: () => {
        saveActiveFile();
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Toggle Table of Contents",
      icon: <List size={16} />,
      action: () => {
        toggleToc();
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Open Settings",
      icon: <Settings size={16} />,
      action: () => {
        setSettingsOpen(true);
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Open Knowledge Graph",
      icon: <Search size={16} />,
      action: () => {
        useStore.getState().setGraphModalOpen(true);
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Open Vault Statistics (Activity)",
      icon: <List size={16} />,
      action: () => {
        useStore.getState().setStatsModalOpen(true);
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Open Trash Bin",
      icon: <FolderOpen size={16} />,
      action: () => {
        useStore.getState().setTrashModalOpen(true);
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Open Git Sync & Version Control",
      icon: <Settings size={16} />,
      action: () => {
        useStore.getState().setGitModalOpen(true);
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "View Note History (Git)",
      icon: <FileText size={16} />,
      action: () => {
        if (window.openGitHistory) window.openGitHistory();
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Export to HTML",
      icon: <FileCode size={16} />,
      action: () => {
        exportService.exportToHTML(
          document.querySelector(".prose")?.innerHTML || "",
        );
        setCmdPaletteOpen(false);
      },
    },
    {
      name: "Export to PDF",
      icon: <FileText size={16} />,
      action: () => {
        exportService.exportToPDF();
        setCmdPaletteOpen(false);
      },
    },
  ];
  const filteredCmdActions = cmdActions.filter((a) => {
    if (a.hideInVault && useStore.getState().workspaceMode === "vault")
      return false;
    return a.name.toLowerCase().includes(cmdSearch.toLowerCase());
  });
  return (
    <div
      className={`modal-overlay cmd-palette ${isCmdPaletteOpen ? "open" : ""}`}
      onClick={() => setCmdPaletteOpen(false)}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <Search size={18} color="var(--text-secondary)" />
          <input
            autoFocus={isCmdPaletteOpen}
            value={cmdSearch}
            onChange={(e) => setCmdSearch(e.target.value)}
            placeholder="Type a command..."
            className="cmd-palette-input"
          />
        </div>
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {noteResults.map((note, i) => (
            <div
              key={`note-${i}`}
              className="cmd-palette-item"
              onClick={() => {
                openNoteFromVault({
                  id: note.id,
                  name: note.name,
                  type: "note",
                });
                setCmdPaletteOpen(false);
              }}
            >
              <FileText size={16} color="var(--accent)" /> {note.name}
            </div>
          ))}
          {noteResults.length > 0 && filteredCmdActions.length > 0 && (
            <div
              style={{
                padding: "8px 16px",
                fontSize: "11px",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              Commands
            </div>
          )}
          {filteredCmdActions.map((act, i) => (
            <div key={i} className="cmd-palette-item" onClick={act.action}>
              {act.icon} {act.name}
            </div>
          ))}
          {noteResults.length === 0 && filteredCmdActions.length === 0 && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
