import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { logger } from "../services/logger";

let mermaidRenderQueue = Promise.resolve();

export function useMermaidRenderer(proseRef, htmlContent, theme) {
  const effectIdRef = useRef(0);

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

    const currentEffectId = ++effectIdRef.current;
    let isMounted = true;

    const renderMermaid = async () => {
      try {
        for (let i = 0; i < mermaidNodes.length; i++) {
          if (!isMounted || currentEffectId !== effectIdRef.current) break;
          const node = mermaidNodes[i];
          const parent = node.parentElement; // The <pre> tag
          if (parent && parent.tagName === "PRE") {
            const id = `mermaid-svg-${Date.now()}-${i}-${currentEffectId}`;

            // Queue mermaid renders to prevent concurrent render errors
            const { svg } = await new Promise((resolve, reject) => {
              mermaidRenderQueue = mermaidRenderQueue
                .then(async () => {
                  if (!isMounted || currentEffectId !== effectIdRef.current) {
                    return { svg: null };
                  }
                  try {
                    const result = await mermaid.render(id, node.textContent);
                    resolve(result);
                  } catch (e) {
                    reject(e);
                  }
                })
                .catch(() => {
                  // Catch any previous errors so the queue doesn't stay rejected
                });
            });

            if (svg && isMounted && currentEffectId === effectIdRef.current) {
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
