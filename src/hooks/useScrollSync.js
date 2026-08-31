import { useEffect, useRef } from "react";

/**
 * Synchronizes scrolling between the CodeMirror editor and the Markdown preview.
 *
 * @param {boolean} isSplit - Whether the editor is in split mode (editing and preview).
 * @param {import("react").RefObject<HTMLElement>} proseRef - Reference to the preview container.
 * @returns {{ handleProseScroll: (e: Event) => void }} Object containing the scroll handler for the preview.
 */
export function useScrollSync(isSplit, proseRef) {
  const syncTimeoutRef = useRef(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  const handleEditorScroll = (e) => {
    if (!isSplit || isSyncingRight.current) return;
    isSyncingLeft.current = true;

    const scroller = e.target;
    if (!scroller.classList.contains("cm-scroller")) return;

    const percentage =
      scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight);
    if (proseRef.current) {
      proseRef.current.scrollTop =
        percentage *
        (proseRef.current.scrollHeight - proseRef.current.clientHeight);
    }

    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isSyncingLeft.current = false;
    }, 50);
  };

  const handleProseScroll = (e) => {
    if (!isSplit || isSyncingLeft.current) return;
    isSyncingRight.current = true;

    const percentage =
      e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    const cmScroller = document.querySelector(".cm-scroller");
    if (cmScroller) {
      cmScroller.scrollTop = Math.round(
        percentage * (cmScroller.scrollHeight - cmScroller.clientHeight),
      );
    }

    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isSyncingRight.current = false;
    }, 50);
  };

  useEffect(() => {
    const cmScroller = document.querySelector(".cm-scroller");
    if (cmScroller) {
      cmScroller.addEventListener("scroll", handleEditorScroll);
      return () => cmScroller.removeEventListener("scroll", handleEditorScroll);
    }
  }, [isSplit]);

  return { handleProseScroll };
}
