import React from "react";
import { X, FileText } from "lucide-react";
import { useDocumentStore } from "../store/documentStore";
import "../styles/TabsBar.css";

export default function TabsBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useDocumentStore();

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
