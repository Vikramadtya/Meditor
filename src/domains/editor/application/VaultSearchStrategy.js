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
   * @returns {Promise<Record<string, Array<{id: string, name: string, path: string}>>>}
   */
  async getAllTags() {
    const tagsMap = {};
    if (!vaultRepository.db) return tagsMap;

    const notes = vaultRepository.findAllNotes();
    for (const note of notes) {
      if (!note.tags) continue;

      const tags = note.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length === 0) continue;

      try {
        const filePath = await vaultService.getNotePath(note.id);
        const noteRef = { id: note.id, name: note.name, path: filePath };

        for (const t of tags) {
          if (!tagsMap[t]) tagsMap[t] = [];
          tagsMap[t].push(noteRef);
        }
      } catch (err) {
        // Ignore path resolution errors for deleted/corrupted notes
      }
    }
    return tagsMap;
  }
}
