import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { useUIStore } from "./store/uiStore";
import { useFileStore } from "./store/fileStore";
import { useSettingsStore } from "./store/settingsStore";
import { fileService } from "./services/fileService";
import { logger } from "./services/logger";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import Titlebar from "./components/Titlebar";
import Sidebar from "./components/Sidebar";
import EditorPane from "./components/EditorPane";
import FloatingActionBar from "./components/FloatingActionBar";
import SettingsModal from "./components/Settings/SettingsModal";
import CommandPalette from "./components/CommandPalette";
import GlobalSearchModal from "./components/GlobalSearchModal";

import "./styles/Modals.css";

function App() {
  const { theme } = useUIStore();
  const { markdown, autoSaveFile, currentFilePath } = useFileStore();
  const { typography, customRules } = useSettingsStore();

  useKeyboardShortcuts();

  useEffect(() => {
    logger.info("Application starting, initializing Neutralino API...");
    fileService.initApp();
  }, []);

  // Apply theme class
  useEffect(() => {
    if (theme === "light") document.body.classList.add("light-mode");
    else document.body.classList.remove("light-mode");
  }, [theme]);

  // Apply typography settings as CSS custom properties so all prose
  // styles react instantly without a rebuild.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--prose-font", typography.proseFont);
    root.style.setProperty("--prose-size", `${typography.fontSize}px`);
    root.style.setProperty("--prose-line-height", typography.lineHeight);
    root.style.setProperty(
      "--prose-width",
      typography.proseWidth > 0 ? `${typography.proseWidth}px` : "none",
    );
    root.style.setProperty("--prose-h1", `${typography.h1Scale}em`);
    root.style.setProperty("--prose-h2", `${typography.h2Scale}em`);
    root.style.setProperty("--prose-h3", `${typography.h3Scale}em`);
    root.style.setProperty("--prose-h4", `${typography.h4Scale}em`);
    document.body.setAttribute("data-table", typography.tableStyle);
  }, [typography]);

  // Inject Custom Rules CSS
  useEffect(() => {
    let styleEl = document.getElementById("custom-rules-css");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "custom-rules-css";
      document.head.appendChild(styleEl);
    }
    const combinedCSS = customRules.map((rule) => rule.css || "").join("\n");
    styleEl.innerHTML = combinedCSS;
  }, [customRules]);

  // Debounced auto-save (2s after last keystroke)
  useEffect(() => {
    if (!currentFilePath) return;
    const timer = setTimeout(() => autoSaveFile(), 2000);
    return () => clearTimeout(timer);
  }, [markdown, currentFilePath, autoSaveFile]);

  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--bg-glass)",
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(16px)",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}
      />

      <Titlebar />
      <div className="app-container">
        <Sidebar />
        <EditorPane />
      </div>
      <FloatingActionBar />

      {/* Global Modals */}
      <SettingsModal />
      <CommandPalette />
      <GlobalSearchModal />
    </>
  );
}

export default App;
