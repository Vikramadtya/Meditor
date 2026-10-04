import { Logger } from "../../../core/infrastructure/Logger";
import { Observability } from "../../../core/infrastructure/Observability";

const log = Logger.forContext("ImageResolver");

const imageCache = new Map();

export function clearImageCache() {
  imageCache.clear();
}

export function getMimeType(path) {
  const ext = path.split(".").pop().toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

export function resolveAbsolutePath(imgPath, currentFilePath, currentFolder) {
  let resolvedPath = imgPath;
  try {
    resolvedPath = decodeURIComponent(imgPath);
  } catch (e) {
    log.warn(`Could not URL-decode image path, using raw: ${imgPath}`);
  }
  if (
    !resolvedPath.startsWith("http://") &&
    !resolvedPath.startsWith("https://") &&
    !resolvedPath.startsWith("data:")
  ) {
    if (resolvedPath.startsWith("/")) {
      if (currentFolder) {
        resolvedPath = currentFolder + resolvedPath;
      } else {
        log.warn("Image has absolute path but no currentFolder is set", { imgPath });
      }
    } else {
      if (currentFilePath) {
        const parts = currentFilePath.split("/");
        parts.pop();
        resolvedPath = parts.join("/") + "/" + resolvedPath;
      } else {
        log.warn("Image has relative path but no currentFilePath is set", { imgPath });
      }
    }
  }
  return resolvedPath;
}

export function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function inlineLocalImages(
  rawHtml,
  currentFilePath,
  currentFolder,
) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  const images = doc.querySelectorAll("img");

  if (images.length === 0) return doc.body.innerHTML;

  // Create a dedicated trace for the full image inlining pass
  const trace = Observability.startTrace("UI: Inline Local Images");
  trace.rootSpan.setAttribute("image_count", images.length);
  trace.rootSpan.setAttribute("file_path", currentFilePath || "unknown");

  let successCount = 0;
  let cacheHitCount = 0;
  let failCount = 0;

  for (let img of images) {
    let src = img.getAttribute("src");
    if (!src || src.startsWith("http") || src.startsWith("data:")) {
      continue;
    }

    const absPath = resolveAbsolutePath(src, currentFilePath, currentFolder);

    if (imageCache.has(absPath)) {
      img.setAttribute("src", imageCache.get(absPath));
      cacheHitCount++;
      continue;
    }

    const span = trace.createSpan("FS: Read Image");
    span.setAttribute("resolved_path", absPath);

    try {
      const t0 = performance.now();
      const buffer = await Neutralino.filesystem.readBinaryFile(absPath);
      const elapsed = Math.round(performance.now() - t0);
      const mime = getMimeType(absPath);
      const base64 = arrayBufferToBase64(buffer);
      const dataUrl = `data:${mime};base64,${base64}`;
      imageCache.set(absPath, dataUrl);
      img.setAttribute("src", dataUrl);
      span.setAttribute("mime", mime);
      span.setAttribute("duration_ms", elapsed);
      span.end("ok");
      successCount++;
      log.debug(`Image loaded in ${elapsed}ms: ${absPath}`);
    } catch (err) {
      failCount++;
      span.setAttribute("error", err.message || String(err));
      span.end("error");
      log.error(`Failed to load local image: ${absPath}`, err);
    }
  }

  trace.rootSpan.setAttribute("success", successCount);
  trace.rootSpan.setAttribute("cache_hits", cacheHitCount);
  trace.rootSpan.setAttribute("failures", failCount);
  trace.end(failCount > 0 ? "partial" : "ok");

  if (failCount > 0) {
    log.warn(`Image inlining complete: ${successCount} ok, ${cacheHitCount} cached, ${failCount} failed`);
  } else {
    log.info(`Image inlining complete: ${successCount} ok, ${cacheHitCount} cached`);
  }

  return doc.body.innerHTML;
}
