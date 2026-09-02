import { useEffect } from "react";
import { useStore } from "../core/store/index";

/**
 * Global keyboard shortcut handler.
 * Split into editor shortcuts and vault shortcuts.
 *
 * IMPORTANT: We use { capture: true } so the listener fires on the capture
 * phase — before CodeMirror or any other focused element can consume the event.
 *
 * @returns {void}
 */
export function useKeyboardShortcuts() {
  const { toggleMode, setCmdPaletteOpen, setGlobalSearchOpen, saveActiveFile } =
    useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      switch (e.key.toLowerCase()) {
        // --- Editor Shortcuts ---
        case "s":
          e.preventDefault();
          e.stopPropagation();
          saveActiveFile();
          break;
        case "e":
          e.preventDefault();
          e.stopPropagation();
          toggleMode();
          break;
        case "enter":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            saveActiveFile();
            const { isEditMode } = useStore.getState();
            if (isEditMode) {
              toggleMode();
            }
          }
          break;

        // --- Vault & Global Shortcuts ---
        case "k":
          e.preventDefault();
          e.stopPropagation();
          setCmdPaletteOpen(true);
          break;
        case "f":
          if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            setGlobalSearchOpen(true);
          }
          break;

        /* ── macOS Native Shortcut Fallbacks ──
           Neutralino on macOS doesn't have an Edit menu, so standard WebView
           shortcuts (Cmd+C, V, X) are often swallowed. We manually trigger them. */
        case "c":
          document.execCommand("copy");
          break;
        case "x":
          document.execCommand("cut");
          break;
        case "v":
          document.execCommand("paste");
          break;
        case "a":
          document.execCommand("selectAll");
          break;
        case "z":
          if (e.shiftKey) {
            document.execCommand("redo");
          } else {
            document.execCommand("undo");
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [toggleMode, setCmdPaletteOpen, setGlobalSearchOpen, saveActiveFile]);
}
