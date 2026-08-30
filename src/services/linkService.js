import { fileSystem as fileService } from "../infrastructure/NeutralinoFileSystem.js";
import { vaultService } from "./vaultService";
import { useStore as useWorkspaceStore } from "../store/index.js";
import { logger } from "../infrastructure/Logger.js";

export const linkService = {
  /**
   * Scans all markdown files in the workspace or vault for wiki-links targeting the current file.
   * @param {string} targetNoteName - The logical name (or file basename) of the target note.
   * @returns {Array} List of notes that link to the target.
   */
  async getBacklinksForNote(targetNoteName) {
    if (!targetNoteName) return [];

    const { workspaceMode, workspaceRoot, currentFolder } =
      useWorkspaceStore.getState();
    const searchRoot = workspaceRoot || currentFolder;
    if (!searchRoot) return [];

    try {
      const backlinks = [];
      const linkRegex = /\[\[(.*?)(?:\|.*?)?\]\]/g; // match [[Link]] and [[Link|Alias]]
      const targetLower = targetNoteName.toLowerCase();

      if (workspaceMode === "vault" && vaultService.db) {
        const notesRes = vaultService.db.exec(
          "SELECT id, name FROM notes WHERE is_deleted = 0",
        );
        if (notesRes[0]) {
          for (const row of notesRes[0].values) {
            const [noteId, noteName] = row;
            if (noteName === targetNoteName) continue;

            try {
              const filePath = await vaultService.getNotePath(noteId);
              const content = await fileService.readFile(filePath);
              let match;
              let found = false;
              while ((match = linkRegex.exec(content)) !== null) {
                if (match[1].toLowerCase() === targetLower) {
                  found = true;
                  break;
                }
              }
              if (found)
                backlinks.push({ id: noteId, name: noteName, path: filePath });
            } catch (err) {
              /* ignore read errors for single files */
            }
          }
        }
      } else {
        // Folder mode
        const entries = await fileService.readDirectory(searchRoot);
        const filesToScan = entries.filter(
          (e) => e.type === "FILE" && e.entry.endsWith(".md"),
        );

        for (const file of filesToScan) {
          const logicalName = file.entry.replace(".md", "");
          if (logicalName === targetNoteName) continue;

          const filePath = `${searchRoot}/${file.entry}`;
          try {
            const content = await fileService.readFile(filePath);
            let match;
            let found = false;
            while ((match = linkRegex.exec(content)) !== null) {
              if (match[1].toLowerCase() === targetLower) {
                found = true;
                break;
              }
            }
            if (found)
              backlinks.push({
                id: file.entry,
                name: logicalName,
                path: filePath,
              });
          } catch (err) {}
        }
      }

      return backlinks;
    } catch (err) {
      logger.error("Failed to fetch backlinks", err);
      return [];
    }
  },

  /**
   * Tries to open a note by its logical name (wiki-link name)
   */
  async openNoteByName(noteName) {
    const { workspaceMode, workspaceRoot, currentFolder, openNoteFromVault } =
      useWorkspaceStore.getState();
    const { openFile } = (await import("../store/index")).useStore.getState();

    if (workspaceMode === "vault") {
      const dbRes = vaultService.db?.exec(
        "SELECT id, name FROM notes WHERE name=?",
        [noteName],
      );
      if (dbRes && dbRes[0] && dbRes[0].values.length > 0) {
        const row = dbRes[0].values[0];
        await openNoteFromVault({ id: row[0], name: row[1] });
      } else {
        // Fallback: try finding a file directly if not in DB?
        logger.warn("Note not found in vault: " + noteName);
      }
    } else {
      const searchRoot = workspaceRoot || currentFolder;
      const fullPath = `${searchRoot}/${noteName}.md`;
      await openFile(fullPath);
    }
  },
};
