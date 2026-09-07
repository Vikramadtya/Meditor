import { useEffect } from "react";
import { useStore } from "../../store/index";
import { saveActiveFile } from "../../store/actions";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      const { toggleMode, setCmdPaletteOpen, setGlobalSearchOpen, isEditMode } =
        useStore.getState();

      switch (e.key.toLowerCase()) {
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
            if (isEditMode) {
              toggleMode();
            }
          }
          break;
        case "k":
          e.preventDefault();
          e.stopPropagation();
          setCmdPaletteOpen(true);
          break;
        case "o":
          if (e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            setGlobalSearchOpen(true);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);
}
