import { useEffect } from "react";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";

const imageCache = new Map();

// Helper to resolve relative path
const resolvePath = (basePath, relativePath) => {
  // Decode URI components in case there are %20 etc.
  try {
    relativePath = decodeURIComponent(relativePath);
  } catch (e) {
    // ignore
  }

  const parts = basePath.split(/[/\\]/);
  parts.pop(); // remove file name or trailing slash, now it's directory

  const relativeParts = relativePath.split("/");
  for (const part of relativeParts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
};

const getMimeType = (path) => {
  const ext = path.split(".").pop().toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
};

export function useImageInterceptor(
  proseRef,
  currentFilePath,
  currentFolder,
  htmlContent,
) {
  useEffect(() => {
    if (!proseRef.current) return;

    // We need either the file path or the workspace folder to resolve relative images
    const basePath = currentFilePath || currentFolder;
    if (!basePath) return;

    const images = proseRef.current.querySelectorAll("img");

    images.forEach(async (img) => {
      let src = img.getAttribute("src");
      if (!src) return;

      // Check if it's a local file relative or absolute path
      if (
        !src.startsWith("http://") &&
        !src.startsWith("https://") &&
        !src.startsWith("data:") &&
        !src.startsWith("blob:")
      ) {
        let absolutePath;
        if (src.startsWith("/")) {
          absolutePath = src;
        } else {
          absolutePath = resolvePath(basePath, src);
        }

        // If we already resolved this image (or it failed), use the cache
        if (imageCache.has(absolutePath)) {
          const cachedUrl = imageCache.get(absolutePath);
          if (cachedUrl) {
            img.src = cachedUrl;
          }
          return;
        }

        try {
          const buffer = await fileService.readBinaryFile(absolutePath);

          const mimeType = getMimeType(absolutePath);
          const blob = new Blob([buffer], { type: mimeType });
          const url = URL.createObjectURL(blob);

          imageCache.set(absolutePath, url);

          // Revoke the old URL if it was already an Object URL to prevent memory leaks
          const oldSrc = img.src;
          if (oldSrc && oldSrc.startsWith("blob:")) {
            URL.revokeObjectURL(oldSrc);
          }

          img.src = url;
        } catch (e) {
          // Cache the failure as null so we don't infinitely retry missing images
          imageCache.set(absolutePath, null);
          logger.warn(`Could not load local image: ${absolutePath}`, e);
        }
      }
    });
  }, [htmlContent, currentFilePath, currentFolder, proseRef]);
}
