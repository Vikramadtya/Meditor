import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { useUIStore } from "./store/uiStore";
import { useFileStore } from "./store/fileStore";
import { fileService } from "./services/fileService";
import { logger } from "./services/logger";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import Titlebar from "./components/Titlebar";
import Sidebar from "./components/Sidebar";
import EditorPane from "./components/EditorPane";
import FloatingActionBar from "./components/FloatingActionBar";
import SettingsModal from "./components/SettingsModal";
import CommandPalette from "./components/CommandPalette";

import "./styles/Modals.css"; // Load global modal styles

function App() {
  const { theme } = useUIStore();
  const { markdown, autoSaveFile, currentFilePath } = useFileStore();

  useKeyboardShortcuts();

  useEffect(() => {
    logger.info("Application starting, initializing Neutralino API...");
    fileService.initApp();
  }, []);

  useEffect(() => {
    if (theme === "light") document.body.classList.add("light-mode");
    else document.body.classList.remove("light-mode");
  }, [theme]);

  // Debounced Auto-Save Background Daemon
  useEffect(() => {
    if (!currentFilePath) return;
    const timer = setTimeout(() => {
      autoSaveFile();
    }, 2000);
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
    </>
  );
}

export default App;
