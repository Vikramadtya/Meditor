import { useShallow } from "zustand/react/shallow";
import React, { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "../../store/index";
import { iconBtnStyle } from "./SettingsStyles";
import AppearanceTab from "./AppearanceTab";
import TypographyTab from "./TypographyTab";
import MarkdownTab from "./MarkdownTab";
import CustomRulesTab from "./CustomRulesTab";
import EditorTab from "./EditorTab";
import SystemTab from "./SystemTab";
import HelpTab from "./HelpTab";

/**
 * Main modal component for application settings.
 * Renders a sidebar navigation and manages the currently active settings tab.
 *
 * @returns {React.ReactElement|null} The settings modal or null if not open.
 */
export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen } = useStore(
    useShallow((s) => ({
      isSettingsOpen: s.isSettingsOpen,
      setSettingsOpen: s.setSettingsOpen,
    })),
  );
  const [activeTab, setActiveTab] = useState("general");
  if (!isSettingsOpen) return null;
  return (
    <div className="modal-overlay open" onClick={() => setSettingsOpen(false)}>
      <div
        className="modal-content settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-sidebar">
          <div className="settings-sidebar-header">
            <h2 className="settings-title">Settings</h2>
          </div>
          <div className="settings-sidebar-nav">
            <button
              className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              Appearance
            </button>
            <button
              className={`settings-nav-item ${activeTab === "typography" ? "active" : ""}`}
              onClick={() => setActiveTab("typography")}
            >
              Typography
            </button>
            <button
              className={`settings-nav-item ${activeTab === "editor" ? "active" : ""}`}
              onClick={() => setActiveTab("editor")}
            >
              Editor
            </button>
            <button
              className={`settings-nav-item ${activeTab === "markdown" ? "active" : ""}`}
              onClick={() => setActiveTab("markdown")}
            >
              Markdown Engine
            </button>
            <button
              className={`settings-nav-item ${activeTab === "rules" ? "active" : ""}`}
              onClick={() => setActiveTab("rules")}
            >
              Custom Rules
            </button>
            <button
              className={`settings-nav-item ${activeTab === "system" ? "active" : ""}`}
              onClick={() => setActiveTab("system")}
            >
              System / Storage
            </button>

            <button
              className={`settings-nav-item ${activeTab === "help" ? "active" : ""}`}
              onClick={() => setActiveTab("help")}
            >
              Help & Guide
            </button>
          </div>
        </div>

        <div className="settings-main">
          <div className="settings-header">
            <button onClick={() => setSettingsOpen(false)} style={iconBtnStyle}>
              <X size={18} />
            </button>
          </div>
          <div className="settings-body">
            {activeTab === "general" && <AppearanceTab />}
            {activeTab === "typography" && <TypographyTab />}
            {activeTab === "editor" && <EditorTab />}
            {activeTab === "markdown" && <MarkdownTab />}
            {activeTab === "rules" && <CustomRulesTab />}
            {activeTab === "system" && <SystemTab />}
            {activeTab === "help" && <HelpTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
