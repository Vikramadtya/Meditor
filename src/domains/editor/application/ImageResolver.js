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
  if (
    !imgPath.startsWith("http://") &&
    !imgPath.startsWith("https://") &&
    !imgPath.startsWith("data:")
  ) {
    if (imgPath.startsWith("/")) {
      if (currentFolder) {
        resolvedPath = currentFolder + imgPath;
      }
    } else {
      if (currentFilePath) {
        const parts = currentFilePath.split("/");
        parts.pop();
        resolvedPath = parts.join("/") + "/" + imgPath;
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
      const buffer = await Neutralino.filesystem.readBinaryFile(absPath);
      const mime = getMimeType(absPath);
      const base64 = arrayBufferToBase64(buffer);
      const dataUrl = `data:${mime};base64,${base64}`;
      imageCache.set(absPath, dataUrl);
      img.setAttribute("src", dataUrl);
    } catch (err) {
      console.warn("Failed to load local image:", absPath, err);
    }
  }
  return doc.body.innerHTML;
}
