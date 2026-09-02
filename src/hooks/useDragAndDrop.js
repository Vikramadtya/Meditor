/**
 * @fileoverview Drag-and-drop + paste image handler for the CodeMirror editor.
 *
 * On drop or paste of an image:
 * 1. Prompts the user for a filename.
 * 2. Saves the image to the correct vault assets folder.
 * 3. Inserts a markdown image reference at the cursor.
 * 4. Copies the markdown link to the clipboard.
 * 5. Records the image in the vault DB.
 */

import { useMemo } from "react";
import { EditorView } from "@codemirror/view";
import toast from "react-hot-toast";
import { fileSystem as fileService } from "../infrastructure/NeutralinoFileSystem";
import { Logger } from "../infrastructure/Logger";
import { useStore } from "../store/index";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";
import { vaultService } from "../application/vault/VaultService";
import { generateId } from "../utils/generateId";
import { clearImageCache } from "./useMarkdown";

const logger = Logger.forContext("DragAndDrop");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Sanitise a path segment so it's filesystem-safe. */
const sanitize = (s) => s.replace(/[/\\:*?"<>|]/g, "_");

/**
 * Resolves vault-relative asset path for a note.
 *
 * @param {string} noteId - The ID of the note.
 * @param {string} currentFolder - The current folder path.
 * @returns {{destFolder: string, markdownPath: string}|null} The destination folder and markdown path, or null if note can't be located.
 */
function resolveVaultImagePaths(activeVaultItem, currentFolder) {
  if (!activeVaultItem || !activeVaultItem.path) return null;

  const pathParts = activeVaultItem.path.split("/");
  // Remove the note name itself to get the directory segment
  pathParts.pop();
  const pathSegment = pathParts.join("/");

  return {
    destFolder: `${currentFolder}/assets/images/${pathSegment}`,
    markdownPath: `/assets/images/${pathSegment}`,
  };
}

async function ensureDir(dirPath, currentFolder) {
  const parts = dirPath.split("/");
  let current = "";
  for (const part of parts) {
    if (!part) continue;
    current += (current ? "/" : "") + part;
    if (current.startsWith(currentFolder)) {
      try {
        await fileService.createDirectory(current);
      } catch (e) {
        /* ignore parse error */
      }
    }
  }
}

/**
 * Saves an image ArrayBuffer to disk and records it in the vault DB.
 *
 * @param {ArrayBuffer} arrayBuffer - The image data.
 * @param {string} destPath - The destination path to write the image.
 * @param {string|null} noteId - The associated note ID.
 * @param {string} fileName - The filename of the image.
 * @returns {Promise<void>}
 */
async function persistImage(arrayBuffer, destPath, noteId, fileName) {
  await fileService.writeBinaryFile(destPath, arrayBuffer);

  // Record in vault DB (best-effort — non-fatal if it fails)
  try {
    const imageId = generateId();
    // No longer needed, image is just placed on disk
    await vaultService.save();
  } catch (err) {
    logger.warn("Could not record image in DB:", err);
  }
}

/**
 * Reads a File object as an ArrayBuffer via FileReader.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<ArrayBuffer>} The read array buffer.
 */
function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Prompts for a filename, processes the image, and inserts the markdown.
 * Shared by both drop and paste handlers.
 *
 * @param {File} file - The image file to process.
 * @param {number} insertPos - The position in the editor to insert the markdown text.
 * @param {import("@codemirror/view").EditorView} view - The CodeMirror editor view.
 * @param {string} currentFolder - The current folder path.
 * @param {string} imageSavePath - The relative path to save the image to in folder mode.
 * @returns {Promise<void>}
 */
async function handleImageFile(
  file,
  insertPos,
  view,
  currentFolder,
  imageSavePath,
) {
  const ext = (file.type.split("/")[1] || "png").replace("jpeg", "jpg");
  const defaultName = file.name ? file.name.replace(/\.[^.]+$/, "") : "image";

  const imageName = window.prompt("Save image as (no extension):", defaultName);
  if (!imageName) return; // User cancelled

  const safeBaseName = imageName.replace(/[^a-z0-9_\-]/gi, "_");
  const fileName = `${safeBaseName}.${ext}`;

  const {
    workspaceMode,
    currentFilePath,
    currentFolder: storeFolder,
    activeVaultItem,
  } = useStore.getState();
  const folder = currentFolder || storeFolder;

  if (!folder) {
    toast.error("Open a workspace folder first.");
    return;
  }

  let destFolder;
  let markdownPath;
  let noteId = null;

  if (workspaceMode === "vault") {
    if (!currentFilePath) {
      toast.error("Open a note first before pasting images.");
      return;
    }
    // Use activeVaultItem.id (the DB UUID) — NOT the filename, which is the note name
    noteId = activeVaultItem?.type === "note" ? activeVaultItem.id : null;
    if (!noteId) {
      toast.error("Could not identify the current note.");
      return;
    }
    const paths = resolveVaultImagePaths(activeVaultItem, folder);
    if (!paths) {
      toast.error("Could not locate note in vault hierarchy.");
      return;
    }
    destFolder = paths.destFolder;
    markdownPath = `${paths.markdownPath}/${fileName}`;
  } else {
    const saveDirName = (imageSavePath || "./images").replace(/^\.\//, "");
    destFolder = `${folder}/${saveDirName}`;
    markdownPath = `./${saveDirName}/${fileName}`;
  }

  try {
    await ensureDir(destFolder, folder);

    const destPath = `${destFolder}/${fileName}`;
    const arrayBuffer = await readAsArrayBuffer(file);
    await persistImage(arrayBuffer, destPath, noteId, fileName);

    const insertText = `![${imageName}](${markdownPath})`;

    // Clear the image cache so the newly-saved image renders immediately
    clearImageCache();

    // Insert markdown at cursor position
    view.dispatch({
      changes: { from: insertPos, to: insertPos, insert: insertText },
    });
    // Keep setMarkdown in sync
    const { setMarkdown } = useStore.getState();
    setMarkdown(view.state.doc.toString());

    // Copy link to clipboard
    try {
      await navigator.clipboard.writeText(insertText);
    } catch (e) {
      /* ignore parse error */
    }

    toast.success(`Image saved! Link copied to clipboard.`);
    logger.info(`Image saved: ${destPath}`);
  } catch (err) {
    logger.error("Failed to save image", err);
    toast.error(`Failed to save image: ${err.message ?? "Unknown error"}`);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook to set up drag-and-drop and paste event handlers for CodeMirror.
 *
 * @param {string} currentFolder - The current workspace folder.
 * @param {string} imageSavePath - The configured folder to save images in.
 * @param {Function} setMarkdown - Function to update the markdown state.
 * @returns {import("@codemirror/view").Extension} CodeMirror DOM event handlers extension.
 */
export function useDragAndDrop(currentFolder, imageSavePath, setMarkdown) {
  return useMemo(
    () =>
      EditorView.domEventHandlers({
        drop(event, view) {
          const files = event.dataTransfer?.files;
          if (!files?.length || !files[0].type.startsWith("image/"))
            return false;

          event.preventDefault();
          const file = files[0];

          const posObj = view.posAtCoords({
            x: event.clientX,
            y: event.clientY,
          });
          const pos =
            typeof posObj === "object" ? (posObj?.pos ?? 0) : (posObj ?? 0);

          handleImageFile(file, pos, view, currentFolder, imageSavePath);
          return true;
        },

        paste(event, view) {
          const items = event.clipboardData?.items;
          if (!items) return false;

          let imageItem = null;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              imageItem = items[i];
              break;
            }
          }
          if (!imageItem) return false;

          event.preventDefault();
          const file = imageItem.getAsFile();
          if (!file) return false;

          const pos = view.state.selection.main.head;
          handleImageFile(file, pos, view, currentFolder, imageSavePath);
          return true;
        },
      }),
    [currentFolder, imageSavePath, setMarkdown],
  );
}
