import { create } from "zustand";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";
import toast from "react-hot-toast";

const WELCOME_CONTENT =
  "# Welcome to meditor\n\nA beautiful, super lightweight markdown editor.\n\n## Features\n- Toggle between Edit and View mode\n- Folder navigation sidebar\n- Glassmorphism design";

export const useFileStore = create((set, get) => ({
  markdown: WELCOME_CONTENT,
  savedMarkdown: WELCOME_CONTENT, // tracks the last-saved snapshot
  isDirty: false, // true when unsaved changes exist

  setMarkdown: (markdown) =>
    set((state) => ({
      markdown,
      isDirty: markdown !== state.savedMarkdown,
    })),

  fileName: "Untitled.md",
  setFileName: (fileName) => set({ fileName }),

  currentFolder: null,
  setCurrentFolder: (currentFolder) => set({ currentFolder }),
  files: [],
  setFiles: (files) => set({ files }),
  currentFilePath: null,
  setCurrentFilePath: (currentFilePath) => set({ currentFilePath }),

  // --- Async File System Actions ---

  loadWorkspace: async (folderPath) => {
    try {
      set({ currentFolder: folderPath });
      const entries = await fileService.readDirectory(folderPath);
      set({ files: entries });
      logger.info(`Loaded workspace directory: ${folderPath}`);
    } catch (err) {
      logger.error(`Failed to load workspace directory: ${folderPath}`, err);
      set({ files: [{ entry: `Error: ${err.message}`, type: "FILE" }] });
      toast.error("Failed to load workspace folder");
    }
  },

  openWorkspaceDialog: async () => {
    try {
      const entry = await fileService.showOpenFolderDialog();
      if (entry) {
        await get().loadWorkspace(entry);
        toast.success("Workspace opened");
      }
    } catch (err) {
      logger.error("Error opening folder dialog", err);
      set({
        currentFolder: `Error: ${err.message || "Dialog failed"}`,
        files: [],
      });
      toast.error("Failed to open folder dialog");
    }
  },

  openFileFromSidebar: async (file) => {
    const { currentFolder } = get();
    if (!currentFolder) return;

    if (file.type === "DIRECTORY") {
      let newFolder = currentFolder;
      if (file.entry === "..") {
        const parts = currentFolder.split(/[\\/]/);
        if (parts.length > 1) {
          parts.pop();
          newFolder = parts.join("/") || "/";
        }
      } else {
        const separator =
          currentFolder.endsWith("/") || currentFolder.endsWith("\\")
            ? ""
            : "/";
        newFolder = `${currentFolder}${separator}${file.entry}`;
      }
      await get().loadWorkspace(newFolder);
      return;
    }

    const separator =
      currentFolder.endsWith("/") || currentFolder.endsWith("\\") ? "" : "/";
    const fullPath = `${currentFolder}${separator}${file.entry}`;
    try {
      const content = await fileService.readFile(fullPath);
      set({
        markdown: content,
        savedMarkdown: content,
        isDirty: false,
        fileName: file.entry,
        currentFilePath: fullPath,
      });
      logger.info(`Opened file: ${fullPath}`);
    } catch (err) {
      logger.error(`Error reading file: ${fullPath}`, err);
      toast.error("Could not read the file");
    }
  },

  saveActiveFile: async () => {
    try {
      const { currentFilePath, markdown, currentFolder } = get();
      let savePath = currentFilePath;

      if (!savePath) {
        savePath = await fileService.showSaveDialog();
      }

      if (savePath) {
        await fileService.writeFile(savePath, markdown);
        set({
          fileName: savePath.split(/[\\/]/).pop(),
          currentFilePath: savePath,
          savedMarkdown: markdown,
          isDirty: false,
        });
        if (currentFolder) {
          await get().loadWorkspace(currentFolder);
        }
        logger.info(`Manually saved file to: ${savePath}`);
        toast.success("File saved!", { icon: "💾" });
      }
    } catch (err) {
      logger.error("Error during manual save", err);
      toast.error("Failed to save file");
    }
  },

  exportToHTML: async (htmlContent) => {
    try {
      const savePath = await window.Neutralino.os.showSaveDialog(
        "Export as HTML",
        {
          defaultPath: "export.html",
        },
      );
      if (savePath) {
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export</title><style>body { font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto; }</style></head><body>${htmlContent}</body></html>`;
        await fileService.writeFile(savePath, fullHtml);
        toast.success("HTML Exported Successfully!");
      }
    } catch (e) {
      toast.error("Export failed.");
      logger.error("HTML export error", e);
    }
  },

  exportToPDF: async () => {
    try {
      const savePath = await window.Neutralino.os.showSaveDialog(
        "Export as PDF",
        {
          defaultPath: "export.pdf",
        },
      );
      if (savePath) {
        const proseNode = document.querySelector(".prose");
        if (!proseNode) throw new Error("No preview found");

        // Dynamically import html2pdf to avoid bloating the initial load
        const html2pdf = (await import("html2pdf.js")).default;

        toast.loading("Generating PDF...", { id: "pdf-toast" });
        const pdfBlob = await html2pdf()
          .from(proseNode)
          .set({
            margin: 10,
            filename: "export.pdf",
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .output("blob");

        const arrayBuffer = await pdfBlob.arrayBuffer();
        await fileService.writeBinaryFile(savePath, arrayBuffer);
        toast.success("PDF Exported Successfully!", { id: "pdf-toast" });
      }
    } catch (e) {
      toast.error("PDF Export failed.", { id: "pdf-toast" });
      logger.error("PDF export error", e);
    }
  },

  autoSaveFile: async () => {
    const { currentFilePath, markdown } = get();
    if (!currentFilePath) return;
    try {
      await fileService.writeFile(currentFilePath, markdown);
      set({ savedMarkdown: markdown, isDirty: false });
      logger.info(`Auto-saved file to: ${currentFilePath}`);
    } catch (err) {
      logger.error("Auto-save failed", err);
      toast.error("Auto-save failed!");
    }
  },

  /**
   * Creates a new .md file inside the current workspace folder,
   * then immediately opens it in the editor.
   * @param {string} fileName - The desired filename (e.g. "Notes.md")
   */
  createNewFile: async (rawName) => {
    const { currentFolder } = get();
    if (!currentFolder) {
      toast.error("Open a workspace folder first.");
      return;
    }
    // Ensure the file ends with .md
    const fileName = rawName.endsWith(".md") ? rawName : `${rawName}.md`;
    const filePath = `${currentFolder}/${fileName}`;
    const initialContent = `# ${rawName.replace(/\.md$/, "")}\n`;

    try {
      await fileService.writeFile(filePath, initialContent);
      set({
        markdown: initialContent,
        savedMarkdown: initialContent,
        isDirty: false,
        fileName,
        currentFilePath: filePath,
      });
      await get().loadWorkspace(currentFolder);
      logger.info(`Created new file: ${filePath}`);
      toast.success(`Created ${fileName}`);
    } catch (err) {
      logger.error(`Failed to create file: ${filePath}`, err);
      toast.error("Failed to create file.");
    }
  },
}));
