/**
 * @fileoverview useImageInterceptor
 *
 * IMPORTANT: In vault mode, images are now resolved to base64 data URIs INSIDE
 * useMarkdown before htmlContent is set. This hook therefore only needs to handle
 * the legacy FOLDER mode where markdown files live anywhere on disk and have
 * relative image references (e.g. ./images/foo.png).
 *
 * Vault-mode images no longer go through this hook at all — they are inlined
 * during the markdown render pipeline. This eliminates the race condition where
 * dangerouslySetInnerHTML was resetting img.src back to the placeholder.
 */

import { useEffect } from "react";
import { fileSystem as fileService } from "../infrastructure/NeutralinoFileSystem";
import { Logger } from "../infrastructure/Logger";
import { useStore } from "../store/index";

const logger = Logger.forContext("ImageInterceptor");

/** Persistent cache for folder-mode images: absolute path → base64 data URI */
const folderImageCache = new Map();

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

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

function resolvePath(basePath, relativePath) {
  try {
    relativePath = decodeURIComponent(relativePath);
  } catch (_) {}
  const parts = basePath.split(/[/\\]/);
  parts.pop();
  for (const segment of relativePath.split("/")) {
    if (segment === "." || segment === "") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

/**
 * Patches images in FOLDER mode only.
 * Vault mode images are handled upstream inside useMarkdown.
 */
export function useImageInterceptor(
  proseRef,
  currentFilePath,
  currentFolder,
  htmlContent,
) {
  useEffect(() => {
    const workspaceMode = useStore.getState().workspaceMode;

    // Vault images are already inlined as base64 by useMarkdown — nothing to do.
    if (workspaceMode === "vault") return;

    if (!proseRef.current) return;
    const basePath = currentFilePath || currentFolder;
    if (!basePath) return;

    const images = proseRef.current.querySelectorAll("img");

    images.forEach(async (img) => {
      // In folder mode, useMarkdown still uses the regex to replace local src with
      // data:image/gif + data-src. So we look at data-src here.
      const src = img.getAttribute("data-src") || img.getAttribute("src");
      if (!src) return;
      // Already resolved or a remote URL
      if (
        src.startsWith("data:") ||
        src.startsWith("blob:") ||
        src.startsWith("http://") ||
        src.startsWith("https://")
      )
        return;

      const absolutePath = src.startsWith("/")
        ? src
        : resolvePath(basePath, src);

      let decodedPath;
      try {
        decodedPath = decodeURIComponent(absolutePath);
      } catch (_) {
        decodedPath = absolutePath;
      }

      if (folderImageCache.has(decodedPath)) {
        const cached = folderImageCache.get(decodedPath);
        if (cached) img.src = cached;
        return;
      }

      try {
        const buffer = await fileService.readBinaryFile(decodedPath);
        const mimeType = getMimeType(decodedPath);
        const b64 = arrayBufferToBase64(buffer);
        const dataUri = `data:${mimeType};base64,${b64}`;
        folderImageCache.set(decodedPath, dataUri);
        img.src = dataUri;
      } catch (err) {
        folderImageCache.set(decodedPath, null);
        logger.warn(`Could not load folder-mode image: ${decodedPath}`, err);
      }
    });
  }, [htmlContent, currentFilePath, currentFolder, proseRef]);
}
