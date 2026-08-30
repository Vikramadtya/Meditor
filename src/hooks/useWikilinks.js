import { useEffect } from "react";
import { linkService } from "../services/linkService";

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
            linkService.openNoteByName(noteName);
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
