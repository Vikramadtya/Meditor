import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { useStore } from "./store/index";

import { useSettingsStore } from "./store/settingsStore";
import { fileSystem as fileService } from "./infrastructure/NeutralinoFileSystem";
import { Logger } from "./infrastructure/Logger";
const logger = Logger.forContext("App");
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import Titlebar from "./components/layout/Titlebar";
import Sidebar from "./components/layout/Sidebar";
import EditorPane from "./components/editor/EditorPane";
import FloatingActionBar from "./components/layout/FloatingActionBar";
import ModalManager from "./components/modals/ModalManager";
import WelcomeScreen from "./components/layout/WelcomeScreen";

import "./styles/Modals.css";

function App() {
  const { theme, markdown, autoSaveFile, currentFilePath, currentFolder } =
    useStore();
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
    if (
      !currentFilePath ||
      useSettingsStore.getState().editorConfig.autoSaveMode !== "delay"
    )
      return;
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
        {!currentFolder ? (
          <WelcomeScreen />
        ) : (
          <>
            <Sidebar />
            <EditorPane />
          </>
        )}
      </div>
      <FloatingActionBar />

      <ModalManager />
    </>
  );
}

export default App;
