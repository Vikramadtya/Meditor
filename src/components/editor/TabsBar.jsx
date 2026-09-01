import { useShallow } from "zustand/react/shallow";
import React from "react";
import { X, FileText } from "lucide-react";
import { useStore } from "../../store/index";
import "../../styles/TabsBar.css";

/**
 * Renders the tabs bar displaying open files in the editor.
 * Allows users to switch between files or close them.
 *
 * @returns {React.ReactElement|null} The rendered TabsBar component, or null if no tabs are open.
 */
export default function TabsBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useStore(
    useShallow((s) => ({
      tabs: s.tabs,
      activeTabId: s.activeTabId,
      setActiveTab: s.setActiveTab,
      closeTab: s.closeTab,
    })),
  );
  if (!tabs || tabs.length === 0) return null;
  return (
    <div className="tabs-bar">
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.currentFilePath || tab.fileName}
            >
              <FileText size={12} className="tab-icon" />
              <span className="tab-title">
                {tab.fileName}
                {tab.isDirty ? <span className="dirty-dot" /> : null}
              </span>
              <button
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
