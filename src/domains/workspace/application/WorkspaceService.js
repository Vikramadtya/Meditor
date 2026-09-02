/**
 * @fileoverview Application Service for workspace management.
 * Decides whether a folder is a Vault or plain Folder mode.
 * Orchestrates between fileSystem and vaultService.
 */

import { Logger } from "../../../core/infrastructure/Logger";
import { fileSystem } from "../infrastructure/NeutralinoFileSystem";
import { vaultService } from "../../vault/application/VaultService";

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
    try {
      const loaded = await vaultService.loadVault(folderPath);
      if (loaded) {
        const hierarchy = await vaultService.getFolderContents("notes");
        this._log.info(
          `Opened vault at ${folderPath} — ${hierarchy.length} groups`,
        );
        return { mode: "vault", files: [], hierarchy };
      }
    } catch (e) {
      this._log.debug(
        "Folder is not a valid vault, falling back to folder mode",
        e,
      );
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
