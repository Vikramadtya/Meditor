/**
 * @fileoverview Concrete filesystem adapter over Neutralino.js APIs.
 * Implements the IFileSystem interface (documented via JSDoc).
 * All Neutralino calls are isolated here — nothing else touches window.Neutralino.filesystem.
 */

import { Logger } from "./Logger.js";
import {
  FileNotFoundError,
  FileWriteError,
  DirectoryReadError,
  FileSystemError,
} from "../domain/errors/index.js";

/**
 * @typedef {Object} DirectoryEntry
 * @property {string} entry - File or folder name
 * @property {'FILE'|'DIRECTORY'} type
 */

/**
 * Filesystem adapter using Neutralino APIs.
 * Apply Dependency Inversion: upper layers depend on this class, not raw Neutralino globals.
 */
export class NeutralinoFileSystem {
  constructor() {
    this._log = Logger.forContext("NeutralinoFileSystem");
    /** @type {Map<string, DirectoryEntry[]>} */
    this._directoryCache = new Map();
  }

  async initApp() {
    if (this.isAvailable()) {
      try {
        window.Neutralino.init();
        window.Neutralino.events.on("windowClose", () =>
          window.Neutralino.app.exit(),
        );
      } catch (err) {
        this._log.error("Failed to initialize Neutralino:", err);
      }
    }
  }

  /** @returns {boolean} */
  isAvailable() {
    return !!(window?.Neutralino && window?.NL_PORT);
  }

  /**
   * Reads a directory, returning only markdown files and subdirectories.
   * @param {string} folderPath
   * @returns {Promise<DirectoryEntry[]>}
   */
  async readDirectory(folderPath) {
    if (this._directoryCache.has(folderPath)) {
      return this._directoryCache.get(folderPath);
    }

    if (!this.isAvailable()) {
      this._log.warn("Neutralino not available: returning mock directory data");
      return [
        { entry: "Mock File.md", type: "FILE" },
        { entry: "Mock Folder", type: "DIRECTORY" },
      ];
    }

    // Directories to never expose in the UI
    const HIDDEN_DIRS = new Set([
      "node_modules",
      ".git",
      ".github",
      "dist",
      "build",
      "assets",
      "notes",
      ".DS_Store",
      "__pycache__",
      ".venv",
    ]);

    try {
      const entries =
        await window.Neutralino.filesystem.readDirectory(folderPath);
      const filtered = entries.filter((e) => {
        if (e.entry === ".") return false;
        if (e.entry.startsWith(".") && e.entry !== "..") return false; // hidden files
        if (e.type === "DIRECTORY") {
          if (HIDDEN_DIRS.has(e.entry)) return false;
          return true;
        }
        return e.entry.endsWith(".md") || e.entry.endsWith(".markdown");
      });

      filtered.sort((a, b) => {
        if (a.entry === "..") return -1;
        if (b.entry === "..") return 1;
        if (a.type === "DIRECTORY" && b.type !== "DIRECTORY") return -1;
        if (a.type !== "DIRECTORY" && b.type === "DIRECTORY") return 1;
        return a.entry.localeCompare(b.entry);
      });

      this._directoryCache.set(folderPath, filtered);
      return filtered;
    } catch (err) {
      throw new DirectoryReadError(folderPath, err);
    }
  }

  /**
   * Recursively reads all markdown files in a directory.
   * @param {string} rootPath
   * @returns {Promise<string[]>} Absolute file paths
   */
  async readDirectoryRecursive(rootPath) {
    const results = [];
    const walk = async (dir) => {
      try {
        const entries = await window.Neutralino.filesystem.readDirectory(dir);
        for (const e of entries) {
          if (e.entry === "." || e.entry === "..") continue;
          const fullPath = `${dir}/${e.entry}`;
          if (e.type === "DIRECTORY") {
            await walk(fullPath);
          } else if (e.entry.endsWith(".md")) {
            results.push(fullPath);
          }
        }
      } catch (err) {
        this._log.warn(`Skipping unreadable directory: ${dir}`, err);
      }
    };
    await walk(rootPath);
    return results;
  }

  /**
   * Reads a text file.
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  async readFile(filePath) {
    try {
      return await window.Neutralino.filesystem.readFile(filePath);
    } catch (err) {
      throw new FileNotFoundError(filePath, err);
    }
  }

  /**
   * Reads a binary file as ArrayBuffer.
   * @param {string} filePath
   * @returns {Promise<ArrayBuffer>}
   */
  async readBinaryFile(filePath) {
    try {
      return await window.Neutralino.filesystem.readBinaryFile(filePath);
    } catch (err) {
      throw new FileNotFoundError(filePath, err);
    }
  }

  /**
   * Writes content to a file, creating parent directories as needed.
   * @param {string} filePath
   * @param {string} content
   */
  async writeFile(filePath, content) {
    try {
      const dir = filePath.substring(0, filePath.lastIndexOf("/"));
      if (dir) await this.createDirectory(dir);
      await window.Neutralino.filesystem.writeFile(filePath, content);
      this.clearDirectoryCache(dir);
    } catch (err) {
      throw new FileWriteError(filePath, err);
    }
  }

  /**
   * Writes binary data to a file.
   * @param {string} filePath
   * @param {ArrayBuffer} data
   */
  async writeBinaryFile(filePath, data) {
    try {
      await window.Neutralino.filesystem.writeBinaryFile(filePath, data);
    } catch (err) {
      throw new FileWriteError(filePath, err);
    }
  }

  /**
   * Creates a directory and all parent directories.
   * @param {string} dirPath
   */
  async createDirectory(dirPath) {
    try {
      await window.Neutralino.filesystem.createDirectory(dirPath);
    } catch (err) {
      if (!err?.code?.includes("NE_FS_DIRCRE")) {
        throw new FileSystemError(
          `Failed to create directory: ${dirPath}`,
          dirPath,
          err,
        );
      }
    }
  }

  /**
   * Checks if a path exists.
   * @param {string} path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    try {
      await window.Neutralino.filesystem.getStats(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Shows a native open-folder dialog.
   * @param {string} [title]
   * @returns {Promise<string|null>} Selected folder path or null if cancelled
   */
  async showOpenFolderDialog(title = "Open Folder") {
    const entry = await window.Neutralino.os.showFolderDialog(title);
    return entry || null;
  }

  /**
   * Shows a native save-file dialog.
   * @returns {Promise<string|null>}
   */
  async showSaveDialog() {
    const path = await window.Neutralino.os.showSaveDialog("Save File", {
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    return path || null;
  }

  /**
   * Removes a file.
   * @param {string} filePath
   */
  async removeFile(filePath) {
    try {
      await window.Neutralino.filesystem.removeFile(filePath);
      const dir = filePath.substring(0, filePath.lastIndexOf("/"));
      this.clearDirectoryCache(dir);
    } catch (err) {
      this._log.warn("Failed to remove file: " + filePath, err);
    }
  }

  /**
   * Removes a directory.
   * @param {string} dirPath
   */
  async removeDirectory(dirPath) {
    try {
      // Recursively delete contents first
      try {
        const entries =
          await window.Neutralino.filesystem.readDirectory(dirPath);
        for (const e of entries) {
          if (e.entry === "." || e.entry === "..") continue;
          const fullPath = `${dirPath}/${e.entry}`;
          if (e.type === "DIRECTORY") {
            await this.removeDirectory(fullPath);
          } else {
            await this.removeFile(fullPath);
          }
        }
      } catch (err) {
        // Might not exist
      }
      await window.Neutralino.filesystem.removeDirectory(dirPath);
      const parentDir = dirPath.substring(0, dirPath.lastIndexOf("/"));
      this.clearDirectoryCache(parentDir);
    } catch (err) {
      this._log.warn("Failed to remove directory: " + dirPath, err);
    }
  }

  /** @param {string} dirPath */

  clearDirectoryCache(dirPath) {
    this._directoryCache.delete(dirPath);
  }

  clearAllCache() {
    this._directoryCache.clear();
  }
}

/** Singleton instance — import this throughout the app */
export const fileSystem = new NeutralinoFileSystem();
