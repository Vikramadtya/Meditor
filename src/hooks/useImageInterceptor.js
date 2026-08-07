import { useEffect } from "react";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";

export function useImageInterceptor(proseRef, currentFolder, htmlContent) {
  useEffect(() => {
    if (!proseRef.current || !currentFolder) return;
    const images = proseRef.current.querySelectorAll("img");
    images.forEach(async (img) => {
      const src = img.getAttribute("src");
      if (src && (src.startsWith("./") || src.startsWith("/"))) {
        try {
          const relativePath = src.replace(/^\.\//, "");
          const absolutePath = `${currentFolder}/${relativePath}`;
          const buffer = await fileService.readBinaryFile(absolutePath);
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          img.src = `data:image/png;base64,${base64}`;
        } catch (e) {
          logger.warn(`Could not load local image: ${src}`, e);
        }
      }
    });
  }, [htmlContent, currentFolder, proseRef]);
}
