import { create } from "zustand";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";
import toast from "react-hot-toast";
import { useDocumentStore } from "./documentStore";

export const useWorkspaceStore = create((set, get) => ({
  currentFolder: null,
  setCurrentFolder: (currentFolder) => set({ currentFolder }),

  workspaceRoot: null, // Tracks the root folder opened by the user
  setWorkspaceRoot: (workspaceRoot) => set({ workspaceRoot }),

  files: [],
  setFiles: (files) => set({ files }),

  // --- Async File System Actions ---

  loadWorkspace: async (folderPath) => {
    try {
      set({ currentFolder: folderPath });
      let entries = await fileService.readDirectory(folderPath);
      let { workspaceRoot } = get();

      // If we don't have a workspace root yet, use the current folder
      if (!workspaceRoot) {
        workspaceRoot = folderPath;
        set({ workspaceRoot });
      }

      // If we are inside a subfolder of the workspace root, inject a ".." directory
      if (
        folderPath.length > workspaceRoot.length &&
        folderPath.startsWith(workspaceRoot)
      ) {
        // Ensure we don't duplicate it if the OS actually returned it
        if (!entries.some((e) => e.entry === "..")) {
          entries.unshift({ entry: "..", type: "DIRECTORY" });
        }
      }

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
        set({ workspaceRoot: entry });
        await get().loadWorkspace(entry);
        toast.success("Workspace opened");
      }
    } catch (err) {
      logger.error("Error opening folder dialog", err);
      set({
        currentFolder: `Error: ${err.message || "Dialog failed"}`,
        workspaceRoot: null,
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

    // Defer to documentStore to handle tab logic
    await useDocumentStore.getState().openFile(fullPath);
  },

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
      fileService.clearDirectoryCache(currentFolder); // clear cache
      // Tell the document store to open it in a tab
      await useDocumentStore.getState().openFile(filePath);
      await get().loadWorkspace(currentFolder);
      logger.info(`Created new file: ${filePath}`);
      toast.success(`Created ${fileName}`);
    } catch (err) {
      logger.error(`Failed to create file: ${filePath}`, err);
      toast.error("Failed to create file.");
    }
  },

  createNewFolder: async (folderName) => {
    const { currentFolder } = get();
    if (!currentFolder) {
      toast.error("Open a workspace folder first.");
      return;
    }
    const folderPath = `${currentFolder}/${folderName}`;
    try {
      await fileService.createDirectory(folderPath);
      fileService.clearDirectoryCache(currentFolder); // clear cache
      await get().loadWorkspace(currentFolder);
      logger.info(`Created new folder: ${folderPath}`);
      toast.success(`Created folder ${folderName}`);
    } catch (err) {
      logger.error(`Failed to create folder: ${folderPath}`, err);
      toast.error("Failed to create folder.");
    }
  },
}));
