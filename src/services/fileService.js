/**
 * @fileoverview Abstracts away all Native OS interactions via Neutralino.js
 * Keeps the rest of the application completely decoupled from the desktop environment.
 */

export const fileService = {
  /**
   * Checks if the app is running inside the native Neutralino window.
   * @returns {boolean} True if running natively.
   */
  isAvailable() {
    return !!(window.Neutralino && window.NL_PORT);
  },

  /**
   * Reads a directory and filters for sub-directories and markdown files.
   * @param {string} folderPath - The absolute path of the directory.
   * @returns {Promise<Array>} Sorted array of file/folder objects.
   */
  async readDirectory(folderPath) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    const entries =
      await window.Neutralino.filesystem.readDirectory(folderPath);
    const filtered = entries.filter((e) => {
      if (e.entry === ".") return false;
      if (e.type === "DIRECTORY") return true;
      return e.entry.endsWith(".md") || e.entry.endsWith(".markdown");
    });

    filtered.sort((a, b) => {
      if (a.entry === "..") return -1;
      if (b.entry === "..") return 1;
      if (a.type === "DIRECTORY" && b.type !== "DIRECTORY") return -1;
      if (a.type !== "DIRECTORY" && b.type === "DIRECTORY") return 1;
      return a.entry.localeCompare(b.entry);
    });
    return filtered;
  },

  /**
   * Recursively reads a directory to find all markdown files.
   * Utilizes sessionStorage as temporary storage to cache the index.
   * @param {string} folderPath - The absolute path of the directory.
   * @returns {Promise<Array<string>>} List of absolute paths to markdown files.
   */
  async readDirectoryRecursive(folderPath) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");

    const cacheKey = `meditor_dir_cache_${folderPath}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let results = [];
    try {
      const entries =
        await window.Neutralino.filesystem.readDirectory(folderPath);
      for (const entry of entries) {
        if (
          entry.entry === "." ||
          entry.entry === ".." ||
          entry.entry.startsWith(".")
        )
          continue;

        const fullPath = `${folderPath}/${entry.entry}`;
        if (entry.type === "DIRECTORY") {
          // Note: we don't use the cache wrapper for recursive calls to avoid key pollution,
          // we just do the native read. Wait, actually, let's keep it simple.
          // To avoid infinite complexity, we'll just implement a helper.
          const subEntries =
            await this._readDirectoryRecursiveInternal(fullPath);
          results = results.concat(subEntries);
        } else if (
          entry.entry.endsWith(".md") ||
          entry.entry.endsWith(".markdown")
        ) {
          results.push(fullPath);
        }
      }
    } catch (e) {
      // Ignore permission errors on specific subfolders
    }

    sessionStorage.setItem(cacheKey, JSON.stringify(results));
    return results;
  },

  async _readDirectoryRecursiveInternal(folderPath) {
    let results = [];
    try {
      const entries =
        await window.Neutralino.filesystem.readDirectory(folderPath);
      for (const entry of entries) {
        if (
          entry.entry === "." ||
          entry.entry === ".." ||
          entry.entry.startsWith(".")
        )
          continue;
        const fullPath = `${folderPath}/${entry.entry}`;
        if (entry.type === "DIRECTORY") {
          const subEntries =
            await this._readDirectoryRecursiveInternal(fullPath);
          results = results.concat(subEntries);
        } else if (
          entry.entry.endsWith(".md") ||
          entry.entry.endsWith(".markdown")
        ) {
          results.push(fullPath);
        }
      }
    } catch (e) {}
    return results;
  },

  /**
   * Clears the directory cache for a folder, or all caches to be safe.
   */
  clearDirectoryCache() {
    // SessionStorage iteration
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith("meditor_dir_cache_")) {
        sessionStorage.removeItem(key);
      }
    }
  },

  /**
   * Performs an efficient concurrent search across all markdown files in a directory.
   * @param {string} folderPath - Directory to search in.
   * @param {string} query - Text to search for.
   * @returns {Promise<Array>} Array of matches { filePath, snippet }.
   */
  async searchInFiles(folderPath, query) {
    if (!query || query.trim() === "") return [];
    const files = await this.readDirectoryRecursive(folderPath);

    // Process files in batches to prevent IPC bottlenecks
    const BATCH_SIZE = 50;
    const matches = [];
    const lowerQuery = query.toLowerCase();

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const filePromises = batch.map(async (filePath) => {
        try {
          const content = await this.readFile(filePath);
          if (content.toLowerCase().includes(lowerQuery)) {
            // Find a snippet (context window around the match)
            const index = content.toLowerCase().indexOf(lowerQuery);
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + query.length + 40);

            let snippet = content.slice(start, end).replace(/\n/g, " ");
            if (start > 0) snippet = "..." + snippet;
            if (end < content.length) snippet = snippet + "...";

            matches.push({ filePath, snippet });
          }
        } catch (e) {
          // Ignore read errors
        }
      });
      await Promise.all(filePromises);
    }
    return matches;
  },

  /**
   * Reads text content of a file.
   * @param {string} filePath - Absolute path to the file.
   * @returns {Promise<string>} File content as a string.
   */
  async readFile(filePath) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.filesystem.readFile(filePath);
  },

  /**
   * Writes text content to a file.
   * @param {string} filePath - Absolute path to the file.
   * @param {string} content - Text content to save.
   */
  async writeFile(filePath, content) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.filesystem.writeFile(filePath, content);
  },

  /**
   * Opens the native OS folder selection dialog.
   * @returns {Promise<string>} Selected folder path.
   */
  async showOpenFolderDialog(title = "Open Folder") {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.os.showFolderDialog(title);
  },

  /**
   * Opens the native OS file save dialog.
   * @returns {Promise<string>} Selected file path.
   */
  async showSaveDialog(title = "Save File", defaultName = "Untitled.md") {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.os.showSaveDialog(title, {
      defaultPath: defaultName,
      filters: [{ name: "Markdown files", extensions: ["md", "markdown"] }],
    });
  },

  /**
   * Initializes the native window and registers close events.
   */
  async initApp() {
    if (this.isAvailable()) {
      try {
        window.Neutralino.init();
        window.Neutralino.events.on("windowClose", () =>
          window.Neutralino.app.exit(),
        );
      } catch (err) {
        console.error("Failed to initialize Neutralino:", err);
      }
    }
  },

  /**
   * Reads binary content of a file (useful for images).
   * @param {string} filePath - Absolute path to the file.
   * @returns {Promise<ArrayBuffer>} File content as binary.
   */
  async readBinaryFile(filePath) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.filesystem.readBinaryFile(filePath);
  },

  /**
   * Writes binary content to a file.
   * @param {string} filePath - Absolute path to the file.
   * @param {ArrayBuffer} buffer - File content as binary.
   */
  async writeBinaryFile(filePath, buffer) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.filesystem.writeBinaryFile(filePath, buffer);
  },

  /**
   * Copies a file from source to destination.
   * @param {string} source - Absolute source path.
   * @param {string} destination - Absolute destination path.
   */
  async copyFile(source, destination) {
    if (!this.isAvailable()) throw new Error("Neutralino not available");
    return await window.Neutralino.filesystem.copyFile(source, destination);
  },

  /**
   * Creates a directory. Ignores errors if it already exists.
   * @param {string} folderPath - Absolute folder path to create.
   */
  async createDirectory(folderPath) {
    if (!this.isAvailable()) return;
    try {
      await window.Neutralino.filesystem.createDirectory(folderPath);
    } catch (e) {
      // Ignore if it already exists
    }
  },
};
