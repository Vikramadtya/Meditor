import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";

/**
 * A custom hook that attaches global keyboard event listeners.
 * Extracts away the messy `window.addEventListener` logic from the UI.
 *
 * Shortcuts:
 * - Cmd+K: Opens the Command Palette
 * - Cmd+S: Saves the active file
 * - Cmd+E: Toggles between Edit and View mode
 */
export function useKeyboardShortcuts() {
  const { toggleMode, setCmdPaletteOpen } = useUIStore();
  const { saveActiveFile } = useFileStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Listen for Cmd on Mac or Ctrl on Windows
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setCmdPaletteOpen(true);
        } else if (e.key === "s") {
          e.preventDefault();
          saveActiveFile();
        } else if (e.key === "e") {
          e.preventDefault();
          toggleMode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleMode, setCmdPaletteOpen, saveActiveFile]);
}
