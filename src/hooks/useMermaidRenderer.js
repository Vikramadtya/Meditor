import { useLayoutEffect, useRef } from "react";
import mermaid from "mermaid";
import { Logger } from "../infrastructure/Logger";
const logger = Logger.forContext("App");

let mermaidRenderQueue = Promise.resolve();
const mermaidCache = new Map();

/**
 * Hook to render Mermaid diagrams in markdown content.
 * Replaces `code.language-mermaid` blocks with rendered SVG diagrams.
 *
 * @param {import("react").RefObject<HTMLElement>} proseRef - Reference to the element containing the rendered markdown.
 * @param {string} htmlContent - The rendered HTML content.
 * @param {string} theme - The current UI theme ("light" or "dark").
 */
export function useMermaidRenderer(proseRef, htmlContent, theme) {
  const effectIdRef = useRef(0);

  useLayoutEffect(() => {
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
            const rawText = node.textContent;

            // If we have a cached SVG for this exact text, inject it synchronously!
            if (mermaidCache.has(rawText)) {
              const svg = mermaidCache.get(rawText);
              if (svg) {
                const div = document.createElement("div");
                div.className = "mermaid-diagram";
                div.innerHTML = svg;
                parent.replaceWith(div);
              }
              continue; // Skip async render
            }

            const id = `mermaid-svg-${Date.now()}-${i}-${currentEffectId}`;

            // Queue mermaid renders to prevent concurrent render errors
            const { svg } = await new Promise((resolve, reject) => {
              mermaidRenderQueue = mermaidRenderQueue
                .then(async () => {
                  if (!isMounted || currentEffectId !== effectIdRef.current) {
                    resolve({ svg: null });
                    return;
                  }
                  try {
                    const result = await mermaid.render(id, rawText);
                    resolve(result);
                  } catch (e) {
                    reject(e);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            });

            if (svg && isMounted && currentEffectId === effectIdRef.current) {
              mermaidCache.set(rawText, svg);
              const div = document.createElement("div");
              div.className = "mermaid-diagram";
              div.innerHTML = svg;
              parent.replaceWith(div);
            }
          }
        }
      } catch (err) {
        logger.warn("Mermaid rendering error", err);
        import("react-hot-toast").then(({ default: toast }) => {
          toast.error("Mermaid error: " + err.message);
        });
      }
    };

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [htmlContent, theme, proseRef]);
}
