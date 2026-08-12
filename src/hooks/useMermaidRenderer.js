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

    if (mermaidNodes.length === 0) return;

    let isMounted = true;

    const renderMermaid = async () => {
      try {
        for (let i = 0; i < mermaidNodes.length; i++) {
          if (!isMounted) break;
          const node = mermaidNodes[i];
          const parent = node.parentElement; // The <pre> tag
          if (parent && parent.tagName === "PRE") {
            const id = `mermaid-svg-${Date.now()}-${i}`;
            const { svg } = await mermaid.render(id, node.textContent);

            if (isMounted) {
              const div = document.createElement("div");
              div.className = "mermaid-diagram";
              div.innerHTML = svg;
              parent.replaceWith(div);
            }
          }
        }
      } catch (err) {
        logger.warn("Mermaid rendering error", err);
      }
    };

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [htmlContent, theme, proseRef]);
}
