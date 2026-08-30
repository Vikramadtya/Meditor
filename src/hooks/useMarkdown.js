import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItKatex from "markdown-it-katex";
import admonitionPlugin from "../utils/markdown-it-admonitions";
import customRulesPlugin from "../utils/markdown-it-custom-rules";
import markdownItMkDocsTabs from "../utils/markdown-it-mkdocs-tabs";
import wikilinksPlugin from "../utils/markdown-it-wikilinks";
import { useStore } from "../store/index";

let mdInstance = null;
let currentConfigStr = "";

function getMarkdownInstance(mdConfig) {
  const configStr = JSON.stringify(mdConfig);
  if (mdInstance && currentConfigStr === configStr) {
    return mdInstance;
  }

  const preset = mdConfig.dialect === "commonmark" ? "commonmark" : "default";
  const parser = new MarkdownIt(preset, {
    html: mdConfig.allowHtml,
    linkify: mdConfig.linkify,
    typographer: mdConfig.typographer,
    breaks: true,
  });

  parser.use(markdownItTaskLists, { enabled: true });
  parser.use(markdownItKatex);
  parser.use(admonitionPlugin);
  parser.use(markdownItMkDocsTabs);
  parser.use(wikilinksPlugin);
  parser.use(customRulesPlugin, { customRules: mdConfig.customRules });

  mdInstance = parser;
  currentConfigStr = configStr;

  return parser;
}

// ─── Image resolver ───────────────────────────────────────────────────────────

/** Persistent cache: absolute file path → data URI string (or null on failure) */
const imageBase64Cache = new Map();

const MIME_MAP = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
};

function getMimeType(path) {
  const ext = path.split(".").pop().toLowerCase();
  return MIME_MAP[ext] ?? "application/octet-stream";
}

function resolveAbsolutePath(
  src,
  currentFilePath,
  currentFolder,
  workspaceMode,
  vaultPath,
) {
  try {
    src = decodeURIComponent(src);
  } catch (_) {}

  // Vault mode: any path containing "assets/" is rooted at the vault
  if (workspaceMode === "vault" && src.includes("assets/")) {
    const assetPart = src.substring(src.indexOf("assets/"));
    return `${vaultPath}/${assetPart}`;
  }

  // Absolute path starting with "/"
  if (src.startsWith("/")) {
    if (workspaceMode === "vault") {
      const normalized = src.startsWith("/dist/assets/")
        ? src.replace("/dist/", "/")
        : src;
      return `${vaultPath}${normalized}`;
    }
    return src;
  }

  // Relative path — resolve against the current file's directory
  const base = currentFilePath || currentFolder;
  if (!base) return null;

  const parts = base.split(/[/\\]/);
  parts.pop(); // remove filename

  for (const segment of src.split("/")) {
    if (segment === "." || segment === "") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

/**
 * Given raw HTML that may contain `<img src="local/path">` tags,
 * reads every local image from disk and replaces the src with a base64
 * data URI. Returns the HTML with all images inlined.
 */
async function inlineLocalImages(rawHtml, currentFilePath, currentFolder) {
  const { workspaceMode, currentFolder: vaultPath } = useStore.getState();

  // Match all <img … src="…"> that are not already data:/http:/https:/blob:
  const imgSrcRe =
    /<img([^>]*)src=["'](?!http|https|data:|blob:)([^"']*)["']([^>]*)>/gi;

  // Collect all unique local paths first
  const localSrcs = new Set();
  let m;
  while ((m = imgSrcRe.exec(rawHtml)) !== null) {
    const rawSrc = m[2];
    if (rawSrc) localSrcs.add(rawSrc);
  }

  if (localSrcs.size === 0) return rawHtml;

  // Resolve + load all images in parallel
  await Promise.all(
    Array.from(localSrcs).map(async (rawSrc) => {
      let decodedSrc;
      try {
        decodedSrc = decodeURIComponent(rawSrc);
      } catch (_) {
        decodedSrc = rawSrc;
      }

      const absolutePath = resolveAbsolutePath(
        decodedSrc,
        currentFilePath,
        currentFolder,
        workspaceMode,
        vaultPath,
      );

      if (!absolutePath || imageBase64Cache.has(absolutePath)) return;

      try {
        const buffer =
          await window.Neutralino.filesystem.readBinaryFile(absolutePath);
        const mimeType = getMimeType(absolutePath);
        const b64 = arrayBufferToBase64(buffer);
        imageBase64Cache.set(absolutePath, `data:${mimeType};base64,${b64}`);
      } catch (err) {
        imageBase64Cache.set(absolutePath, null); // mark as failed so we don't retry
        logger.warn(`[useMarkdown] Could not load image: ${absolutePath}`, err);
      }
    }),
  );

  // Replace all local src attributes with their base64 data URIs
  return rawHtml.replace(imgSrcRe, (full, pre, rawSrc, post) => {
    let decodedSrc;
    try {
      decodedSrc = decodeURIComponent(rawSrc);
    } catch (_) {
      decodedSrc = rawSrc;
    }

    const absolutePath = resolveAbsolutePath(
      decodedSrc,
      currentFilePath,
      currentFolder,
      workspaceMode,
      vaultPath,
    );

    const dataUri = absolutePath ? imageBase64Cache.get(absolutePath) : null;

    if (dataUri) {
      return `<img${pre}src="${dataUri}"${post}>`;
    }

    // Fallback: 1×1 transparent gif placeholder so we don't show a broken icon
    return `<img${pre}src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="${post}>`;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function useMarkdown(markdown, mdConfig, debounceMs = 100) {
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setToc] = useState([]);
  const [frontmatter, setFrontmatter] = useState(null);

  const debounceTimerRef = useRef(null);
  const renderIdRef = useRef(0); // detect stale renders

  // Expose a cache-clear so the image interceptor hook can call it on file change
  useEffect(() => {
    // When the file changes (markdown resets), old cache entries are still valid
    // (same vault, same paths) – we keep the cache across file switches intentionally.
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const renderId = ++renderIdRef.current;

      try {
        let content = markdown;
        let parsedFm = null;

        const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
        if (fmMatch) {
          content = markdown.slice(fmMatch[0].length);
          const yamlString = fmMatch[1];
          parsedFm = {};
          yamlString.split("\n").forEach((line) => {
            const idx = line.indexOf(":");
            if (idx > 0) {
              parsedFm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
            }
          });
        }

        const md = getMarkdownInstance(mdConfig);
        const env = {};
        let rawHtml = md.render(content, env);

        // Build TOC
        const tokens = md.parse(content, env);
        const parsedToc = [];
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i].type === "heading_open") {
            const level = parseInt(tokens[i].tag.replace("h", ""), 10);
            const textToken = tokens[i + 1];
            if (textToken && textToken.type === "inline") {
              parsedToc.push({ level, text: textToken.content });
            }
          }
        }

        // ── Inline all local images BEFORE sanitizing ──
        // This ensures dangerouslySetInnerHTML always has the real pixels,
        // no async DOM patching race conditions.
        const { currentFilePath, currentFolder } = useStore.getState();
        if (window.Neutralino) {
          rawHtml = await inlineLocalImages(
            rawHtml,
            currentFilePath,
            currentFolder,
          );
        }

        // Guard: if a newer render was triggered while we were awaiting, discard this one
        if (renderId !== renderIdRef.current) return;

        DOMPurify.addHook("afterSanitizeAttributes", function (node) {
          if (
            node.tagName === "INPUT" &&
            node.type === "checkbox" &&
            node.classList.contains("task-list-item-checkbox")
          ) {
            node.removeAttribute("disabled");
          }
        });

        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_ATTR: [
            "target",
            "className",
            "class",
            "data-tab-idx",
            "data-note",
          ],
        });

        DOMPurify.removeHook("afterSanitizeAttributes");

        setHtmlContent(cleanHtml);
        setToc(parsedToc);
        setFrontmatter(parsedFm);
      } catch (err) {
        logger.error("Markdown Parse Error:", err);
      }
    }, debounceMs);

    return () => clearTimeout(debounceTimerRef.current);
  }, [markdown, mdConfig, debounceMs]);

  return { htmlContent, toc, frontmatter };
}

/** Call this to invalidate cached images (e.g. after an image is overwritten). */
export function clearImageCache() {
  imageBase64Cache.clear();
}
