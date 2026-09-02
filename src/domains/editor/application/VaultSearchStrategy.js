import { fileSystem as fileService } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../../vault/infrastructure/SqliteVaultRepository";
import { vaultService } from "../../vault/application/VaultService";

/**
 * Search strategy optimized for Vault Mode.
 * Uses SQLite metadata instead of full disk crawls where possible.
 */
export class VaultSearchStrategy {
  /**
   * @param {string} searchRoot - The root path of the vault.
   */
  constructor(searchRoot) {
    this.searchRoot = searchRoot;
  }

  /**
   * Retrieves all backlinks for a given note name.
   * Reads files to parse markdown content to extract wikilinks.
   * @param {string} targetNoteName - Exact note name without extension.
   * @returns {Promise<Array<{file: string, excerpt: string}>>}
   */
  async getBacklinks(targetNoteName) {
    const backlinks = [];
    const linkRegex = /\[\[(.*?)(?:\|.*?)?\]\]/g;
    const targetLower = targetNoteName.toLowerCase();

    if (!vaultRepository.db) return backlinks;

    const notes = vaultRepository.findAllNotes();
    for (const note of notes) {
      if (note.name === targetNoteName) continue;
      try {
        const filePath = await vaultService.getNotePath(note.id);
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
          backlinks.push({ id: note.id, name: note.name, path: filePath });
      } catch (err) {}
    }
    return backlinks;
  }

  /**
   * Fast tag retrieval directly from the SQLite vault.db tags column.
   * @returns {Promise<Record<string, Array<{file: string, line: string}>>>}
   */
  async getAllTags() {
    const filesToScan = await fileService.readDirectory(
      `${this.searchRoot}/notes`,
    );
    const tagsMap = {};
    const hashTagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;

    for (const file of filesToScan) {
      if (file.type !== "FILE" || !file.entry.endsWith(".md")) continue;

      const filePath = `${this.searchRoot}/notes/${file.entry}`;
      const noteId = file.entry.replace(".md", "");
      const dbRes = vaultRepository.db?.exec(
        "SELECT name FROM notes WHERE id=?",
        [noteId],
      );
      const logicalName = dbRes?.[0]?.values?.[0]?.[0] || file.entry;

      const content = await fileService.readFile(filePath);
      const tagsForFile = new Set();

      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?(?:\n|$)/);
      if (fmMatch) {
        fmMatch[1].split("\n").forEach((line) => {
          const idx = line.indexOf(":");
          if (idx > 0 && line.slice(0, idx).trim() === "tags") {
            const val = line.slice(idx + 1).trim();
            if (val.startsWith("[") && val.endsWith("]")) {
              val
                .slice(1, -1)
                .split(",")
                .forEach((t) => {
                  if (t.trim()) tagsForFile.add(t.trim());
                });
            } else {
              tagsForFile.add(val);
            }
          }
        });
      }

      let match;
      while ((match = hashTagRegex.exec(content)) !== null) {
        tagsForFile.add(match[1]);
      }

      const noteRef = { id: file.entry, name: logicalName, path: filePath };
      tagsForFile.forEach((t) => {
        if (!tagsMap[t]) tagsMap[t] = [];
        tagsMap[t].push(noteRef);
      });
    }
    return tagsMap;
  }
}
