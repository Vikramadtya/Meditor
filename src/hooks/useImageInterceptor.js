import { useEffect } from "react";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";

const imageCache = new Map();

export function useImageInterceptor(proseRef, currentFolder, htmlContent) {
  useEffect(() => {
    if (!proseRef.current || !currentFolder) return;
    const images = proseRef.current.querySelectorAll("img");

    images.forEach(async (img) => {
      const src = img.getAttribute("src");
      if (src && (src.startsWith("./") || src.startsWith("/"))) {
        const relativePath = src.replace(/^\.\//, "");
        const absolutePath = `${currentFolder}/${relativePath}`;

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

          // Use Blob and Object URL instead of massive btoa/reduce string concatenation
          const blob = new Blob([buffer], { type: "image/png" });
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
          logger.warn(`Could not load local image: ${src}`, e);
        }
      }
    });
  }, [htmlContent, currentFolder, proseRef]);
}
