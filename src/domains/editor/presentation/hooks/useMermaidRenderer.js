import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Logger } from "../../../../core/infrastructure/Logger";
const logger = Logger.forContext("MermaidRenderer");

export function useMermaidRenderer(proseRef, htmlContent, theme) {
  useEffect(() => {
    if (!proseRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

    const mermaidNodes = proseRef.current.querySelectorAll(
      "code.language-mermaid",
    );
    if (mermaidNodes.length === 0) return;

    // In Mermaid v11, to render nodes inline automatically, we must give them the class "mermaid"
    // and then call mermaid.run()
    const targetNodes = [];

    mermaidNodes.forEach((node, i) => {
      const parent = node.parentElement;
      if (parent && parent.tagName === "PRE") {
        const id = `mermaid-svg-${Date.now()}-${i}`;

        // Mermaid run() prefers div elements with the class 'mermaid' containing the raw text
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid";
        wrapper.id = id;
        wrapper.textContent = node.textContent; // unescaped text

        parent.replaceWith(wrapper);
        targetNodes.push(wrapper);
      }
    });

    if (targetNodes.length > 0) {
      mermaid
        .run({
          nodes: targetNodes,
        })
        .catch((err) => {
          logger.error("Error running mermaid:", err);
          // Fallback: show error inline for each failed node
          targetNodes.forEach((node) => {
            if (!node.querySelector("svg")) {
              node.innerHTML = `<pre style="color: red; padding: 12px; border: 1px solid red; border-radius: 4px; overflow-x: auto;">Mermaid Error:\n${err.message || err}</pre>`;
            }
          });
        });
    }
  }, [htmlContent, theme]);
}
