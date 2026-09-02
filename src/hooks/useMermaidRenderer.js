import { useLayoutEffect, useRef } from "react";
import mermaid from "mermaid";
import { Logger } from "../core/infrastructure/Logger";
const logger = Logger.forContext("App");

let mermaidRenderQueue = Promise.resolve();
const mermaidCache = new Map();

export function useMermaidRenderer(proseRef, htmlContent, theme) {
  const effectIdRef = useRef(0);

  useLayoutEffect(() => {
    if (!proseRef.current) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

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
          const parent = node.parentElement;
          if (parent && parent.tagName === "PRE") {
            const rawText = node.textContent;

            if (mermaidCache.has(rawText)) {
              const cachedSvg = mermaidCache.get(rawText);
              const div = document.createElement("div");
              div.className = "mermaid-diagram";
              if (cachedSvg.startsWith("<svg")) {
                div.innerHTML = cachedSvg;
              } else {
                div.innerHTML = `<pre style="color: red; padding: 12px; border: 1px solid red; border-radius: 4px; overflow-x: auto;">Mermaid Error:\n${cachedSvg}</pre>`;
              }
              parent.replaceWith(div);
              continue;
            }

            const id = `mermaid-svg-${Date.now()}-${i}-${currentEffectId}`;

            const { svg, error } = await new Promise((resolve) => {
              mermaidRenderQueue = mermaidRenderQueue
                .then(async () => {
                  if (!isMounted || currentEffectId !== effectIdRef.current) {
                    resolve({ svg: null });
                    return;
                  }
                  try {
                    const result = await mermaid.render(id, rawText);
                    resolve({ svg: result.svg });
                  } catch (e) {
                    resolve({ error: e.message || String(e) });
                  }
                })
                .catch((err) => {
                  resolve({ error: err.message || String(err) });
                });
            });

            if (
              (svg || error) &&
              isMounted &&
              currentEffectId === effectIdRef.current
            ) {
              const div = document.createElement("div");
              div.className = "mermaid-diagram";
              if (svg) {
                div.innerHTML = svg;
                mermaidCache.set(rawText, svg);
              } else if (error) {
                const errorStr = `Mermaid Error:\n${error}`;
                div.innerHTML = `<pre style="color: red; padding: 12px; border: 1px solid red; border-radius: 4px; overflow-x: auto;">${errorStr}</pre>`;
                mermaidCache.set(rawText, errorStr);
              }
              parent.replaceWith(div);
            }
          }
        }
      } catch (err) {
        logger.error("Error in useMermaidRenderer", err);
      }
    };

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [htmlContent, theme]);
}
