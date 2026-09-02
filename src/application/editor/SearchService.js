import { Logger } from "../../core/infrastructure/Logger";
import { VaultSearchStrategy } from "./search/VaultSearchStrategy";
import { FolderSearchStrategy } from "./search/FolderSearchStrategy";

const logger = Logger.forContext("SearchService");

/**
 * Service orchestrating search strategies (Vault vs Folder mode)
 * for features like Backlinks and Tag aggregation.
 */
class SearchService {
  /**
   * Resolves the correct search strategy based on the active mode.
   * @param {"vault"|"folder"} workspaceMode - The current workspace mode.
   * @param {string} searchRoot - The root directory of the workspace.
   * @returns {import("./search/VaultSearchStrategy").VaultSearchStrategy|import("./search/FolderSearchStrategy").FolderSearchStrategy}
   * @private
   */
  _getStrategy(workspaceMode, searchRoot) {
    if (workspaceMode === "vault") {
      return new VaultSearchStrategy(searchRoot);
    }
    return new FolderSearchStrategy(searchRoot);
  }

  /**
   * Finds all markdown files referencing the target note.
   * @param {string} targetNoteName - The name of the note to find links for.
   * @param {"vault"|"folder"} workspaceMode - The active mode.
   * @param {string} searchRoot - The directory to search within.
   * @returns {Promise<Array<{file: string, excerpt: string}>>} Array of backlinks.
   */
  async getBacklinks(targetNoteName, workspaceMode, searchRoot) {
    if (!targetNoteName || !searchRoot) return [];
    try {
      const strategy = this._getStrategy(workspaceMode, searchRoot);
      return await strategy.getBacklinks(targetNoteName);
    } catch (err) {
      logger.error("Failed to fetch backlinks", err);
      return [];
    }
  }

  /**
   * Aggregates all tags found across all markdown files in the workspace.
   * @param {"vault"|"folder"} workspaceMode - The active mode.
   * @param {string} searchRoot - The directory to search within.
   * @returns {Promise<Record<string, Array<{file: string, line: string}>>>} Map of tags to their occurrences.
   */
  async getAllTags(workspaceMode, searchRoot) {
    if (!searchRoot) return {};
    try {
      const strategy = this._getStrategy(workspaceMode, searchRoot);
      return await strategy.getAllTags();
    } catch (err) {
      logger.error("Failed to fetch tags", err);
      return {};
    }
  }
}

export const searchService = new SearchService();
