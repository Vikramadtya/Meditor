import { useEffect } from "react";
import mermaid from "mermaid";
import { Logger } from "../../../../core/infrastructure/Logger";
const logger = Logger.forContext("MermaidRenderer");
let isMermaidRunning = false;
let pendingMermaidRun = false;

export function useMermaidRenderer(proseRef, htmlContent, theme) {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    if (!proseRef.current) return;

    const processMermaid = async () => {
      if (!proseRef.current) return;

      const mermaidNodes = proseRef.current.querySelectorAll(
        "code.language-mermaid",
      );
      if (mermaidNodes.length === 0) return;

      const targetNodes = [];
      mermaidNodes.forEach((node, i) => {
        const parent = node.parentElement;
        if (parent && parent.tagName === "PRE") {
          if (parent.hasAttribute("data-mermaid-processed")) return;
          parent.setAttribute("data-mermaid-processed", "true");

          const wrapper = document.createElement("div");
          wrapper.className = "mermaid";
          wrapper.textContent = node.textContent;

          parent.style.display = "none";
          parent.parentNode.insertBefore(wrapper, parent);

          targetNodes.push(wrapper);
        }
      });

      if (targetNodes.length > 0) {
        if (isMermaidRunning) {
          pendingMermaidRun = true;
          return;
        }
        isMermaidRunning = true;
        try {
          const nodesToProcess = Array.from(
            proseRef.current.querySelectorAll(".mermaid"),
          );
          for (let i = 0; i < nodesToProcess.length; i++) {
            const node = nodesToProcess[i];
            if (node.querySelector("svg") || node.querySelector(".error-text"))
              continue;
            try {
              const id = `mermaid-diagram-${Date.now()}-${i}`;
              const text = node.textContent;
              node.innerHTML = "Rendering...";
              const { svg } = await mermaid.render(id, text);
              node.innerHTML = svg;
            } catch (err) {
              logger.error("Error running mermaid for a single node:", err);

              let userFriendlyError = "Unknown syntax error";
              if (err.str) userFriendlyError = err.str;
              else if (err.message) userFriendlyError = err.message;
              else if (typeof err === "string") userFriendlyError = err;
              else {
                try {
                  userFriendlyError = JSON.stringify(err);
                } catch (e) {
                  userFriendlyError = "Crash in layout engine";
                }
              }

              node.innerHTML = `
                  <div class="error-text" style="background-color: #fef2f2; border: 1px solid #f87171; border-radius: 6px; padding: 12px; margin: 8px 0; font-family: var(--font-mono, monospace); font-size: 0.9em; color: #991b1b; overflow-x: auto;">
                    <strong style="display: block; margin-bottom: 8px; color: #b91c1c;">🚨 Mermaid Syntax Error</strong>
                    <pre style="margin: 0; white-space: pre-wrap; font-family: inherit;">${userFriendlyError}</pre>
                  </div>
                `;
            }
          }
        } finally {
          isMermaidRunning = false;
          if (pendingMermaidRun) {
            pendingMermaidRun = false;
            processMermaid();
          }
        }
      }
    };

    // Run initially
    processMermaid();

    // Watch for any changes in the DOM that might restore the PRE tags
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      for (let m of mutations) {
        if (m.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }
      if (shouldProcess) {
        processMermaid();
      }
    });

    observer.observe(proseRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [htmlContent, theme]);
}
