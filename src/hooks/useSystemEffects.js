import { useEffect } from "react";
import { useStore } from "../core/store/index";
import { useSettingsStore } from "../domains/settings/application/settingsStore";
import { fileSystem as fileService } from "../infrastructure/NeutralinoFileSystem";
import { Logger } from "../core/infrastructure/Logger";

const logger = Logger.forContext("App");

/**
 * Hook that sets up system-level effects such as Neutralino initialization,
 * theme application, typography CSS variables injection, custom CSS rules,
 * and debounced autosaving.
 *
 * @returns {void}
 */
export function useSystemEffects() {
  const { theme, markdown, autoSaveFile, currentFilePath } = useStore();
  const { typography, customRules, editorConfig } = useSettingsStore();

  // 1. Initialize Neutralino
  useEffect(() => {
    logger.info("Application starting, initializing Neutralino API...");
    fileService.initApp();
  }, []);

  // 2. Apply CSS Theme
  useEffect(() => {
    if (theme === "light") document.body.classList.add("light-mode");
    else document.body.classList.remove("light-mode");
  }, [theme]);

  // 3. Apply Typography CSS Variables
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

  // 4. Inject Custom CSS Rules
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

  // 5. Debounced Autosave
  useEffect(() => {
    if (!currentFilePath || editorConfig.autoSaveMode !== "delay") return;
    const timer = setTimeout(() => autoSaveFile(), 2000);
    return () => clearTimeout(timer);
  }, [markdown, currentFilePath, autoSaveFile, editorConfig.autoSaveMode]);
}
