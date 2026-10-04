import { useEffect } from "react";
import { searchService } from "../../application/SearchService";
import { useStore } from "../../../../core/store/index";
import { Logger } from "../../../../core/infrastructure/Logger";
import { Observability } from "../../../../core/infrastructure/Observability";

const logger = Logger.forContext("Wikilinks");

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
            const trace = Observability.startTrace("UI: Wikilink Click");
            trace.rootSpan.setAttribute("note_name", noteName);
            logger.info(`Wikilink clicked: "${noteName}"`);
            try {
              useStore.getState().openNoteByName(noteName);
              trace.end("ok");
            } catch (err) {
              logger.error(`Failed to open wikilink note: "${noteName}"`, err);
              trace.rootSpan.setAttribute("error", err.message);
              trace.end("error");
            }
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
