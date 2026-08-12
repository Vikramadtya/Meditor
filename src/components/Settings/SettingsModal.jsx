import React, { useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { iconBtnStyle } from "./SettingsUI";

import AppearanceTab from "./AppearanceTab";
import TypographyTab from "./TypographyTab";
import MarkdownTab from "./MarkdownTab";
import CustomRulesTab from "./CustomRulesTab";
import SystemTab from "./SystemTab";

export default function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen } = useUIStore();
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
            {activeTab === "markdown" && <MarkdownTab />}
            {activeTab === "rules" && <CustomRulesTab />}
            {activeTab === "system" && <SystemTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
