import { useEffect } from "react";
import mermaid from "mermaid";
import { Logger } from "../../../../core/infrastructure/Logger";
const logger = Logger.forContext("MermaidRenderer");
let isMermaidRunning = false;
let pendingMermaidRun = false;

export function useMermaidRenderer(proseRef, htmlContent, theme) {
  useEffect(() => {
    if (!proseRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    const mermaidNodes = proseRef.current.querySelectorAll(
      "code.language-mermaid",
    );
    if (mermaidNodes.length === 0) return;

    const targetNodes = [];
    mermaidNodes.forEach((node, i) => {
      const parent = node.parentElement;
      if (parent && parent.tagName === "PRE") {
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid";
        // Unescape text content for mermaid
        wrapper.textContent = node.textContent;
        parent.replaceWith(wrapper);
        targetNodes.push(wrapper);
      }
    });

    if (targetNodes.length > 0) {
      const runMermaid = async () => {
        if (isMermaidRunning) {
          pendingMermaidRun = true;
          return;
        }
        isMermaidRunning = true;
        try {
          const nodesToProcess = Array.from(
            document.querySelectorAll(".mermaid"),
          );
          for (const node of nodesToProcess) {
            if (node.querySelector("svg") || node.querySelector(".error-text"))
              continue;
            try {
              await mermaid.run({ nodes: [node] });
            } catch (err) {
              logger.error("Error running mermaid for a single node:", err);
              node.innerHTML = `<pre class="error-text" style="color: red; padding: 12px; border: 1px solid red; border-radius: 4px; overflow-x: auto;">Mermaid Error:\n${err.message || err}</pre>`;
            }
          }
        } finally {
          isMermaidRunning = false;
          if (pendingMermaidRun) {
            pendingMermaidRun = false;
            runMermaid();
          }
        }
      };
      runMermaid();
    }
  }, [htmlContent, theme]);
}
