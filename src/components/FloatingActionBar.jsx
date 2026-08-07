import React from "react";
import {
  Eye,
  Edit3,
  FolderTree,
  List,
  Save,
  Search,
  Settings,
  Columns,
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";

export default function FloatingActionBar() {
  const {
    isEditMode,
    toggleMode,
    toggleToc,
    setCmdPaletteOpen,
    setSettingsOpen,
    viewLayout,
    toggleLayout,
  } = useUIStore();
  const { saveActiveFile, openWorkspaceDialog } = useFileStore();

  return (
    <div className="fab">
      <button
        onClick={toggleLayout}
        title="Toggle Split View"
        style={actionButtonStyle}
      >
        <Columns
          size={18}
          color={viewLayout === "split" ? "var(--accent)" : "inherit"}
        />
      </button>
      {viewLayout === "single" && (
        <button
          onClick={toggleMode}
          title="Toggle Mode (Cmd+E)"
          style={actionButtonStyle}
        >
          {isEditMode ? <Eye size={18} /> : <Edit3 size={18} />}
        </button>
      )}
      <div style={dividerStyle} />
      <button
        onClick={openWorkspaceDialog}
        title="Open Workspace"
        style={actionButtonStyle}
      >
        <FolderTree size={18} />
      </button>
      <button
        onClick={toggleToc}
        title="Table of Contents"
        style={actionButtonStyle}
      >
        <List size={18} />
      </button>
      <button
        onClick={saveActiveFile}
        title="Save File (Cmd+S)"
        style={actionButtonStyle}
      >
        <Save size={18} />
      </button>
      <div style={dividerStyle} />
      <button
        onClick={() => setCmdPaletteOpen(true)}
        title="Command Palette (Cmd+K)"
        style={actionButtonStyle}
      >
        <Search size={18} />
      </button>
      <button
        onClick={() => setSettingsOpen(true)}
        title="Settings"
        style={actionButtonStyle}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}

const actionButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-primary)",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "8px",
};
const dividerStyle = {
  width: "1px",
  background: "var(--glass-border)",
  margin: "0 4px",
};
