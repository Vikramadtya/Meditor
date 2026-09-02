import { useEffect } from "react";
import { searchService } from "../application/editor/SearchService";
import { useStore } from "../core/store/index";

/**
 * Hook to handle clicks on wikilinks in rendered Markdown.
 * Prevents default navigation and opens the target note using the store.
 *
 * @param {import("react").RefObject<HTMLElement>} ref - Reference to the container element with rendered markdown.
 */
export function useWikilinks(ref) {
  useEffect(() => {
    if (!ref.current) return;

    const handleWikilinkClick = (e) => {
      let target = e.target;
      while (target && target !== ref.current) {
        if (target.classList && target.classList.contains("wikilink")) {
          e.preventDefault();
          const noteName = target.getAttribute("data-note");
          if (noteName) {
            useStore.getState().openNoteByName(noteName);
          }
          return;
        }
        target = target.parentNode;
      }
    };

    const node = ref.current;
    node.addEventListener("click", handleWikilinkClick);

    return () => {
      node.removeEventListener("click", handleWikilinkClick);
    };
  }, [ref]);
}
