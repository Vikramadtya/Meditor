import { Logger } from "../../../core/infrastructure/Logger";
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
    // Keep as is if it fails to decode
  }
  if (
    !resolvedPath.startsWith("http://") &&
    !resolvedPath.startsWith("https://") &&
    !resolvedPath.startsWith("data:")
  ) {
    if (resolvedPath.startsWith("/")) {
      if (currentFolder) {
        resolvedPath = currentFolder + resolvedPath;
      }
    } else {
      if (currentFilePath) {
        const parts = currentFilePath.split("/");
        parts.pop();
        resolvedPath = parts.join("/") + "/" + resolvedPath;
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

  for (let img of images) {
    let src = img.getAttribute("src");
    if (!src || src.startsWith("http") || src.startsWith("data:")) {
      continue;
    }

    const absPath = resolveAbsolutePath(src, currentFilePath, currentFolder);
    if (imageCache.has(absPath)) {
      img.setAttribute("src", imageCache.get(absPath));
      continue;
    }

    try {
      
      let span = (window.Observability?.createSpan && window.__ACTIVE_TRACE_ID__) ? window.Observability.createSpan("FS: Read Image", window.__ACTIVE_TRACE_ID__, window.__ACTIVE_SPAN_ID__) : null;
      if (span) span.setAttribute("path", absPath);
      
      const buffer = await Neutralino.filesystem.readBinaryFile(absPath);
      const mime = getMimeType(absPath);
      const base64 = arrayBufferToBase64(buffer);
      const dataUrl = `data:${mime};base64,${base64}`;
      imageCache.set(absPath, dataUrl);
      img.setAttribute("src", dataUrl);
      
      if (span) span.end("ok");
    } catch (err) {
      log.error(`Failed to load local image: ${absPath}`, err);
      // We don't have span context here easily if we didn't start one, but we try:
      if (window.__ACTIVE_TRACE_ID__) {
        let span = (window.Observability?.createSpan && window.__ACTIVE_TRACE_ID__) ? window.Observability.createSpan("FS: Read Image", window.__ACTIVE_TRACE_ID__, window.__ACTIVE_SPAN_ID__) : null;
        if (span) {
           span.setAttribute("error", err.message);
           span.end("error");
        }
      }
    }
  }
  return doc.body.innerHTML;
}
