import { useEffect } from "react";

/**
 * Hook to manage MkDocs-style tab switching in rendered Markdown.
 *
 * @param {import("react").RefObject<HTMLElement>} proseRef - Reference to the element containing rendered markdown.
 * @param {string} htmlContent - The rendered HTML content.
 */
export function useMkDocsTabs(proseRef, htmlContent) {
  useEffect(() => {
    if (!proseRef.current) return;

    const handleTabClick = (e) => {
      const btn = e.target.closest(".mkdocs-tab-btn");
      if (!btn) return;

      const idx = btn.getAttribute("data-tab-idx");
      const group = btn.closest(".mkdocs-tabs");
      if (!group) return;

      // Update buttons
      const btns = group.querySelectorAll(".mkdocs-tab-btn");
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Update panes
      const panes = group.querySelectorAll(".mkdocs-tab-pane");
      panes.forEach((p) => {
        if (p.getAttribute("data-tab-idx") === idx) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });
    };

    const container = proseRef.current;
    container.addEventListener("click", handleTabClick);

    return () => {
      container.removeEventListener("click", handleTabClick);
    };
  }, [htmlContent, proseRef]);
}
