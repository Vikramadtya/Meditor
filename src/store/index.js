/**
 * @fileoverview Unified Zustand store using immer middleware for structural sharing.
 *
 * Architecture:
 *   - State is split into named slices (editor, vault/workspace, ui)
 *   - Slices contain ONLY synchronous state mutations
 *   - Async actions are top-level thunks here that call Application Services
 *   - Backward-compat named hooks re-export this store for existing code
 *
 * Design patterns:
 *   - Slice pattern (composable state)
 *   - Command pattern (each action is a discrete command)
 *   - Observer pattern (Zustand subscriptions)
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

import { createEditorSlice, WELCOME_MD } from "./slices/editorSlice.js";
import { createUISlice } from "./slices/uiSlice.js";
import { createVaultSlice } from "./slices/vaultSlice.js";

import { Logger } from "../infrastructure/Logger.js";
import { fileSystem } from "../infrastructure/NeutralinoFileSystem.js";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository.js";
import { vaultService } from "../application/vault/VaultService.js";
import { workspaceService } from "../application/workspace/WorkspaceService.js";
import { gitService } from "../application/git/GitService.js";

const log = Logger.forContext("Store");

// ── Prettier (lazy loaded) ────────────────────────────────────────────────

/**
 * Formats Markdown text using Prettier.
 *
 * @param {string} text - The raw Markdown text.
 * @returns {Promise<string>} The formatted Markdown text, or original text if formatting fails.
 */
async function formatMarkdown(text) {
  try {
    const prettier = (await import("prettier/standalone.js")).default;
    const markdownPlugin = (await import("prettier/plugins/markdown.js"))
      .default;
    return await prettier.format(text, {
      parser: "markdown",
      plugins: [markdownPlugin],
    });
  } catch (err) {
    log.warn("Prettier formatting failed", err);
    return text;
  }
}

// ── Store ─────────────────────────────────────────────────────────────────

/**
 * The main unified Zustand store containing editor, UI, and vault slices.
 */
export const useStore = create(
  persist(
    immer((set, get) => ({
      // ── Compose slices ──────────────────────────────────────────────────
      ...createEditorSlice(set, get),
      ...createUISlice(set, get),
      ...createVaultSlice(set, get),

      // ── Workspace async actions ─────────────────────────────────────────

      /**
       * Loads a folder as vault or folder mode.
       * @param {string} folderPath
       */
      loadWorkspace: async (folderPath) => {
        try {
          const result = await workspaceService.loadWorkspace(folderPath);
          set((s) => {
            s.workspaceMode = result.mode;
            s.currentFolder = folderPath;
            s.workspaceRoot =
              s.workspaceRoot && folderPath.startsWith(s.workspaceRoot)
                ? s.workspaceRoot
                : folderPath;
            s.files = result.files;
            s.vaultHierarchy = result.hierarchy;
            s.activeVaultItem = null;
          });
          log.info(`Loaded workspace: ${folderPath} (mode: ${result.mode})`);
        } catch (err) {
          log.error(`Failed to load workspace: ${folderPath}`, err);
          toast.error("Failed to open workspace");
        }
      },

      /** Opens a native folder picker and loads the selected path. */
      openWorkspaceDialog: async () => {
        try {
          const folder = await workspaceService.pickFolder();
          if (!folder) return;
          set((s) => {
            s.workspaceRoot = folder;
          });
          await get().loadWorkspace(folder);
          toast.success("Workspace opened");
        } catch (err) {
          if (err?.code?.includes("CANCEL")) return;
          log.error("Error opening folder dialog", err);
          toast.error("Failed to open folder");
        }
      },

      /** Opens the native folder picker to create or open a vault. */
      createVaultDialog: async () => {
        try {
          const folder = await workspaceService.pickFolder(
            "Select Vault Folder",
          );
          if (!folder) return;
          set((s) => {
            s.workspaceRoot = folder;
          });

          const isVault = await workspaceService.isVault(folder);
          if (isVault) {
            await get().loadWorkspace(folder);
            toast.success("Vault opened!");
          } else {
            await vaultService.initVault(folder);
            await get().loadWorkspace(folder);
            toast.success("Vault created!");
          }
        } catch (err) {
          if (err?.code?.includes("CANCEL")) return;
          log.error("Error opening/creating vault", err);
          toast.error(
            `Failed to open/create vault: ${err.message ?? err.code ?? err}`,
          );
        }
      },

      /** Reloads vault hierarchy from the repository (after CRUD ops). */
      reloadVaultHierarchy: async () => {
        if (get().workspaceMode === "vault") {
          set((s) => {
            vaultService
              .getFolderContents("notes")
              .then((h) => useStore.getState().setVaultHierarchy(h));
          });
        }
      },

      // ── Vault note navigation ───────────────────────────────────────────

      /**
       * Opens a vault note in the editor.
       * @param {{ id: string, name: string }} note
       */

      // Helper to open a note by logical name (wiki-link name)
      openNoteByName: async (noteName) => {
        const {
          workspaceMode,
          workspaceRoot,
          currentFolder,
          openNoteFromVault,
          openFile,
        } = get();

        if (workspaceMode === "vault") {
          const { vaultRepository } =
            await import("../infrastructure/SqliteVaultRepository.js");
          const dbRes = vaultRepository.db?.exec(
            "SELECT id, name FROM notes WHERE name=?",
            [noteName],
          );
          if (dbRes && dbRes[0] && dbRes[0].values.length > 0) {
            const row = dbRes[0].values[0];
            await openNoteFromVault({ id: row[0], name: row[1] });
          } else {
            console.warn("Note not found in vault: " + noteName);
          }
        } else {
          const searchRoot = workspaceRoot || currentFolder;
          const fullPath = `${searchRoot}/${noteName}.md`;
          await openFile(fullPath);
        }
      },

      openNoteFromVault: async (note) => {
        const { workspaceRoot } = get();
        if (!workspaceRoot) return;
        const fullPath = vaultService.getNotePath(note.id);
        if (!fullPath) {
          log.error(`Could not resolve path for note: ${note.id}`);
          toast.error("Could not open note — path not found");
          return;
        }
        // Open the file first so content is ready, THEN switch the view
        await get().openFile(fullPath, note.name, note);
        set((s) => {
          s.activeVaultItem = note;
        });
      },

      // ── Folder mode navigation ──────────────────────────────────────────

      openFileFromSidebar: async (file) => {
        const { currentFolder } = get();
        if (!currentFolder) return;

        if (file.type === "DIRECTORY") {
          let newFolder = currentFolder;
          if (file.entry === "..") {
            const parts = currentFolder.split(/[/\\]/);
            if (parts.length > 1) {
              parts.pop();
              newFolder = parts.join("/") || "/";
            }
          } else {
            const sep = currentFolder.endsWith("/") ? "" : "/";
            newFolder = `${currentFolder}${sep}${file.entry}`;
          }
          await get().loadWorkspace(newFolder);
          return;
        }

        const sep = currentFolder.endsWith("/") ? "" : "/";
        await get().openFile(`${currentFolder}${sep}${file.entry}`);
      },

      // ── Editor file operations ──────────────────────────────────────────

      openFile: async (fullPath, logicalName = null, vaultItem = null) => {
        try {
          const { tabs } = get();
          const existing = tabs.find(
            (t) => t.id === fullPath || t.currentFilePath === fullPath,
          );
          if (existing) {
            if (vaultItem) {
              existing.vaultItem = vaultItem; // Update in case it changed
            }
            get().setActiveTab(existing.id);
            set((s) => {
              s.isEditMode = false;
            });
            return;
          }

          const content = await fileSystem.readFile(fullPath);
          const fileName = logicalName ?? fullPath.split(/[/\\]/).pop();

          get().openTab({
            id: fullPath,
            fileName,
            currentFilePath: fullPath,
            markdown: content,
            savedMarkdown: content,
            isDirty: false,
            vaultItem,
          });

          // Default to view mode when opening a note
          set((s) => {
            s.isEditMode = false;
          });

          log.info(`Opened file: ${fullPath}`);
        } catch (err) {
          log.error(`Error reading file: ${fullPath}`, err);
          const errMsg = err?.message || err?.code || "Unknown error";
          toast.error(
            `Could not read: ...${fullPath?.split("/").slice(-3).join("/")}\nReason: ${errMsg}`,
            { duration: 8000 },
          );
        }
      },

      saveActiveFile: async () => {
        try {
          const { currentFilePath, markdown, activeTabId } = get();
          // Lazy load settings
          const { useSettingsStore } = await import("./settingsStore.js");
          const { editorConfig } = useSettingsStore.getState();
          let content = markdown;
          let savePath = currentFilePath;

          if (editorConfig?.autoFormatOnSave) {
            content = await formatMarkdown(content);
          }

          if (!savePath) {
            savePath = await fileSystem.showSaveDialog();
          }
          if (!savePath) return;

          await fileSystem.writeFile(savePath, content);
          get().markSaved(savePath, content);

          // Reload folder listing if in folder mode
          const { workspaceMode, currentFolder } = get();
          if (workspaceMode === "folder" && currentFolder) {
            fileSystem.clearDirectoryCache(currentFolder);
            await get().loadWorkspace(currentFolder);
          }

          log.info(`Saved file: ${savePath}`);
          toast.success("File saved!", { icon: "💾" });
        } catch (err) {
          log.error("Save failed", err);
          toast.error("Failed to save file");
        }
      },

      autoSaveFile: async () => {
        const { currentFilePath, markdown } = get();
        if (!currentFilePath) return;
        try {
          const { useSettingsStore } = await import("./settingsStore.js");
          const { editorConfig } = useSettingsStore.getState();
          let content = editorConfig?.autoFormatOnSave
            ? await formatMarkdown(markdown)
            : markdown;

          await fileSystem.writeFile(currentFilePath, content);
          get().markSaved(currentFilePath, content);
          log.info(`Auto-saved: ${currentFilePath}`);
        } catch (err) {
          log.error("Auto-save failed", err);
        }
      },

      // ── Vault item creation ─────────────────────────────────────────────

      createNewFile: async (rawName) => {
        const { currentFolder, workspaceMode } = get();
        if (!currentFolder) {
          toast.error("Open a workspace folder first.");
          return;
        }
        if (workspaceMode === "vault") {
          toast.error(
            "Cannot create raw files in Vault mode. Use the sidebar + button.",
          );
          return;
        }

        const fileName = rawName.endsWith(".md") ? rawName : `${rawName}.md`;
        const filePath = `${currentFolder}/${fileName}`;
        try {
          await fileSystem.writeFile(
            filePath,
            `# ${rawName.replace(/\.md$/, "")}\n`,
          );
          fileSystem.clearDirectoryCache(currentFolder);
          await get().openFile(filePath);
          await get().loadWorkspace(currentFolder);
          toast.success(`Created ${fileName}`);
        } catch (err) {
          log.error(`Failed to create file: ${filePath}`, err);
          toast.error("Failed to create file");
        }
      },

      createNewFolder: async (folderName) => {
        const { currentFolder, workspaceMode } = get();
        if (!currentFolder) {
          toast.error("Open a workspace folder first.");
          return;
        }
        if (workspaceMode === "vault") {
          toast.error("Cannot create raw folders in Vault mode.");
          return;
        }
        try {
          await fileSystem.createDirectory(`${currentFolder}/${folderName}`);
          fileSystem.clearDirectoryCache(currentFolder);
          await get().loadWorkspace(currentFolder);
          toast.success(`Created folder ${folderName}`);
        } catch (err) {
          log.error(`Failed to create folder`, err);
          toast.error("Failed to create folder");
        }
      },
    })),
    {
      name: "meditor-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        viewLayout: state.viewLayout,
        isSidebarOpen: state.isSidebarOpen,
        isTocOpen: state.isTocOpen,
      }),
    },
  ),
);

// ── Backward-compatible named hook aliases ────────────────────────────────
// These allow existing components to keep using useUIStore, useWorkspaceStore, etc.
// without any changes. They all read from the single unified store.

export const useUIStore = useStore;
export const useWorkspaceStore = useStore;
export const useDocumentStore = useStore;
