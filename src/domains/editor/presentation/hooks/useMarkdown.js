import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { useStore } from "../../../../core/store/index";
import { Logger } from "../../../../core/infrastructure/Logger";
import { getMarkdownInstance } from "../../application/MarkdownParser";
import {
  inlineLocalImages,
  clearImageCache,
} from "../../application/ImageResolver";

const log = Logger.forContext("useMarkdown");

export function useMarkdown(markdown, mdConfig, debounceMs = 100) {
  const [html, setHtml] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  const currentFilePath = useStore((state) => state.activeVaultItem?.path);
  const currentFolder = useStore((state) => state.repoPath);
  const workspaceMode = useStore((state) => state.workspaceMode);
  const searchMatchPath = useStore((state) => state.searchMatchPath);
  const activeVaultItem = useStore((state) => state.activeVaultItem);

  const debounceTimer = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const renderMarkdown = async () => {
      setIsRendering(true);
      try {
        const md = getMarkdownInstance(mdConfig);

        // Strip frontmatter if present (simplified regex for frontmatter)
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?(?:\n|$)/;
        const markdownWithoutFrontmatter = markdown.replace(
          frontmatterRegex,
          "",
        );

        let rawHtml = md.render(markdownWithoutFrontmatter || "");

        // Only inline images if we are in vault mode
        if (workspaceMode === "vault") {
          const effectiveFilePath =
            searchMatchPath || activeVaultItem?.path || currentFilePath;
          rawHtml = await inlineLocalImages(
            rawHtml,
            effectiveFilePath,
            currentFolder,
          );
        }

        if (isCancelled) return;

        // Custom DOMPurify hooks
        DOMPurify.addHook("afterSanitizeAttributes", function (node) {
          if (node.tagName === "INPUT" && node.type === "checkbox") {
            if (node.hasAttribute("checked")) {
              node.setAttribute("checked", "checked");
            }
          }
          if (node.tagName === "A") {
            const href = node.getAttribute("href");
            if (
              href &&
              !href.startsWith("http") &&
              !href.startsWith("https") &&
              !href.startsWith("mailto") &&
              !href.startsWith("#")
            ) {
              node.setAttribute("data-wikilink", href);
              node.removeAttribute("href");
              node.style.cursor = "pointer";
              node.style.color = "var(--color-primary)";
              node.style.textDecoration = "underline";
            }
          }
        });

        const safeHtml = DOMPurify.sanitize(rawHtml, {
          ADD_TAGS: ["input"],
          ADD_ATTR: ["type", "checked", "disabled", "data-wikilink"],
        });

        DOMPurify.removeHook("afterSanitizeAttributes");

        if (!isCancelled) {
          setHtml(safeHtml);
        }
      } catch (err) {
        log.error("Error rendering markdown:", err);
        if (!isCancelled) {
          setHtml(
            `<div class="markdown-error">Failed to render markdown: ${err.message}</div>`,
          );
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    if (debounceMs > 0) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(renderMarkdown, debounceMs);
    } else {
      renderMarkdown();
    }

    return () => {
      isCancelled = true;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [
    markdown,
    mdConfig,
    currentFilePath,
    currentFolder,
    workspaceMode,
    debounceMs,
    searchMatchPath,
    activeVaultItem?.path,
  ]);

  return { html, isRendering };
}

export { clearImageCache };
