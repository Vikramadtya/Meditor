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
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";
import { exportService } from "../services/exportService";

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
  } = useUIStore();
  const { saveActiveFile, openWorkspaceDialog } = useFileStore();
  const [cmdSearch, setCmdSearch] = useState("");

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

  const filteredCmdActions = cmdActions.filter((a) =>
    a.name.toLowerCase().includes(cmdSearch.toLowerCase()),
  );

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
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {filteredCmdActions.map((act, i) => (
            <div key={i} className="cmd-palette-item" onClick={act.action}>
              {act.icon} {act.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
