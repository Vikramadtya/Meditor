/**
 * @fileoverview Application Service for workspace management.
 * Decides whether a folder is a Vault or plain Folder mode.
 * Orchestrates between fileSystem and vaultService.
 */

import { Logger } from "../../infrastructure/Logger.js";
import { fileSystem } from "../../infrastructure/NeutralinoFileSystem.js";
import { vaultService } from "../vault/VaultService.js";

class WorkspaceService {
  constructor() {
    this._log = Logger.forContext("WorkspaceService");
  }

  /**
   * Detects if a directory contains a vault.db file.
   * @param {string} folderPath
   * @returns {Promise<boolean>}
   */
  async isVault(folderPath) {
    // First try a direct load — if it succeeds, it's a vault.
    // We use tryLoadVault here to avoid relying on filesystem.exists()
    // which requires the Neutralino runtime to be available.
    try {
      const loaded = await vaultService.loadVault(folderPath);
      return loaded === true;
    } catch {
      return false;
    }
  }

  /**
   * Loads a workspace folder. Returns mode: 'vault' | 'folder'
   * @param {string} folderPath
   * @returns {Promise<{ mode: 'vault'|'folder', files: Array, hierarchy: Array }>}
   */
  async loadWorkspace(folderPath) {
    // Try to load as vault first (reads vault.db from disk)
    const loaded = await vaultService.loadVault(folderPath);
    if (loaded) {
      const hierarchy = await vaultService.getFolderContents("notes");
      this._log.info(
        `Opened vault at ${folderPath} — ${hierarchy.length} groups`,
      );
      return { mode: "vault", files: [], hierarchy };
    }

    // Folder mode fallback
    const files = await fileSystem.readDirectory(folderPath);
    return { mode: "folder", files, hierarchy: [] };
  }

  /**
   * Opens the native folder picker dialog.
   * @param {string} [title]
   * @returns {Promise<string|null>}
   */
  async pickFolder(title = "Open Folder") {
    return fileSystem.showOpenFolderDialog(title);
  }

  /**
   * Reads a folder's files (for folder mode navigation).
   * @param {string} folderPath
   */
  async readDirectory(folderPath) {
    return fileSystem.readDirectory(folderPath);
  }
}

export const workspaceService = new WorkspaceService();
