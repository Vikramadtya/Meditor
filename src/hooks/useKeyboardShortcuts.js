import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";

/**
 * Global keyboard shortcut handler.
 *
 * IMPORTANT: We use { capture: true } so the listener fires on the capture
 * phase — before CodeMirror or any other focused element can consume the event.
 * Without this, Cmd+S / Cmd+K never fire while the editor is focused.
 *
 * Shortcuts:
 * - Cmd+S  : Save the active file
 * - Cmd+K  : Open the Command Palette
 * - Cmd+E  : Toggle Edit / View mode
 */
export function useKeyboardShortcuts() {
  const { toggleMode, setCmdPaletteOpen } = useUIStore();
  const { saveActiveFile } = useFileStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          e.stopPropagation();
          saveActiveFile();
          break;
        case "k":
          e.preventDefault();
          e.stopPropagation();
          setCmdPaletteOpen(true);
          break;
        case "e":
          e.preventDefault();
          e.stopPropagation();
          toggleMode();
          break;
        default:
          break;
      }
    };

    // capture: true = intercept before CodeMirror or any child element
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [toggleMode, setCmdPaletteOpen, saveActiveFile]);
}
