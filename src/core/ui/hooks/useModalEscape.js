import { useEffect } from "react";

/**
 * A React hook that calls `onClose` when the Escape key is pressed.
 * Only active when `isOpen` is true.
 *
 * @param {boolean} isOpen - Whether the modal is currently open.
 * @param {Function} onClose - Callback to execute when Escape is pressed.
 */
export function useModalEscape(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
}
