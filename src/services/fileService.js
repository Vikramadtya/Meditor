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
