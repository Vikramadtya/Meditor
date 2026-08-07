import { useEffect } from "react";
import mermaid from "mermaid";
import { logger } from "../services/logger";

export function useMermaidRenderer(proseRef, htmlContent, theme) {
  useEffect(() => {
    if (!proseRef.current) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

    // Find all markdown code blocks tagged with "mermaid"
    const mermaidNodes = proseRef.current.querySelectorAll(
      "code.language-mermaid",
    );
    if (mermaidNodes.length > 0) {
      mermaidNodes.forEach((node) => {
        const parent = node.parentElement; // The <pre> tag
        if (parent && parent.tagName === "PRE") {
          const div = document.createElement("div");
          div.className = "mermaid";
          div.textContent = node.textContent;
          parent.replaceWith(div);
        }
      });
      // Render all .mermaid divs
      mermaid.run({ querySelector: ".mermaid" }).catch((err) => {
        logger.warn("Mermaid rendering error", err);
      });
    }
  }, [htmlContent, theme, proseRef]);
}
