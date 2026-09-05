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
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setToc] = useState([]);
  const [frontmatter, setFrontmatter] = useState(null);
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

        let contentToRender = markdown;
        let parsedFm = null;

        // Strip frontmatter if present
        const fmMatch = markdown.match(
          /^---\r?\n([\s\S]*?)\r?\n---\r?(?:\n|$)/,
        );
        if (fmMatch) {
          contentToRender = markdown.slice(fmMatch[0].length);
          const yamlString = fmMatch[1];
          parsedFm = {};
          const lines = yamlString.split("\n");
          let currentKey = null;
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (trimmed.startsWith("- ") && currentKey) {
              if (!Array.isArray(parsedFm[currentKey])) {
                parsedFm[currentKey] = parsedFm[currentKey]
                  ? [parsedFm[currentKey]]
                  : [];
              }
              parsedFm[currentKey].push(trimmed.slice(2).trim());
            } else {
              const idx = line.indexOf(":");
              if (idx > 0) {
                currentKey = line.slice(0, idx).trim();
                const val = line.slice(idx + 1).trim();
                if (val) {
                  parsedFm[currentKey] = val;
                } else {
                  parsedFm[currentKey] = [];
                }
              }
            }
          });
        }

        // Extract TOC
        const newToc = [];
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        let match;
        while ((match = headingRegex.exec(contentToRender)) !== null) {
          newToc.push({
            level: match[1].length,
            text: match[2]
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
              .replace(/[*_~`]/g, ""),
          });
        }

        let rawHtml = md.render(contentToRender || "");

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
          setHtmlContent(safeHtml);
          setToc(newToc);
          setFrontmatter(parsedFm);
        }
      } catch (err) {
        log.error("Error rendering markdown:", err);
        if (!isCancelled) {
          setHtmlContent(
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

  return { htmlContent, toc, frontmatter, isRendering };
}

export { clearImageCache };
