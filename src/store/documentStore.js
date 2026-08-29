import { create } from "zustand";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";
import toast from "react-hot-toast";
import { useWorkspaceStore } from "./workspaceStore";

const WELCOME_CONTENT =
  "# Welcome to meditor\n\nA beautiful, super lightweight markdown editor.\n\n## Features\n- Toggle between Edit and View mode\n- Folder navigation sidebar\n- Glassmorphism design";

export const useDocumentStore = create((set, get) => {
  // Helper to sync the active tab's state to the root properties for backward compatibility
  const syncToRoot = (tabs, activeTabId) => {
    if (!tabs || tabs.length === 0) {
      return {
        markdown: "",
        savedMarkdown: "",
        isDirty: false,
        fileName: "",
        currentFilePath: null,
      };
    }
    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    return {
      markdown: activeTab.markdown,
      savedMarkdown: activeTab.savedMarkdown,
      isDirty: activeTab.isDirty,
      fileName: activeTab.fileName,
      currentFilePath: activeTab.currentFilePath,
      activeTabId: activeTab.id, // Ensure activeTabId is correct if it fell back to tabs[0]
    };
  };

  const initialTabs = [
    {
      id: "Untitled.md", // Use filePath as ID if available, otherwise fileName
      fileName: "Untitled.md",
      currentFilePath: null,
      markdown: WELCOME_CONTENT,
      savedMarkdown: WELCOME_CONTENT,
      isDirty: false,
    },
  ];

  return {
    tabs: initialTabs,
    activeTabId: "Untitled.md",

    ...syncToRoot(initialTabs, "Untitled.md"),

    setMarkdown: (markdown) => {
      set((state) => {
        const newTabs = state.tabs.map((tab) => {
          if (tab.id === state.activeTabId) {
            return {
              ...tab,
              markdown,
              isDirty: markdown !== tab.savedMarkdown,
            };
          }
          return tab;
        });
        return {
          tabs: newTabs,
          ...syncToRoot(newTabs, state.activeTabId),
        };
      });
    },

    setFileName: (fileName) => {
      set((state) => {
        const newTabs = state.tabs.map((tab) =>
          tab.id === state.activeTabId ? { ...tab, fileName } : tab,
        );
        return { tabs: newTabs, ...syncToRoot(newTabs, state.activeTabId) };
      });
    },

    setCurrentFilePath: (currentFilePath) => {
      set((state) => {
        const newTabs = state.tabs.map((tab) =>
          tab.id === state.activeTabId ? { ...tab, currentFilePath } : tab,
        );
        return { tabs: newTabs, ...syncToRoot(newTabs, state.activeTabId) };
      });
    },

    // --- Tab Actions ---
    setActiveTab: (tabId) => {
      set((state) => ({
        ...syncToRoot(state.tabs, tabId),
      }));
    },

    closeTab: (tabId) => {
      set((state) => {
        const newTabs = state.tabs.filter((t) => t.id !== tabId);
        if (newTabs.length === 0) {
          // Add an empty untitled tab if closing the last one
          newTabs.push({
            id: `Untitled-${Date.now()}.md`,
            fileName: "Untitled.md",
            currentFilePath: null,
            markdown: "",
            savedMarkdown: "",
            isDirty: false,
          });
        }
        const newActiveId =
          state.activeTabId === tabId
            ? newTabs[newTabs.length - 1].id
            : state.activeTabId;
        return {
          tabs: newTabs,
          ...syncToRoot(newTabs, newActiveId),
        };
      });
    },

    // --- Async File Actions ---
    saveActiveFile: async () => {
      try {
        const { currentFilePath, markdown, activeTabId, tabs } = get();
        let savePath = currentFilePath;

        if (!savePath) {
          savePath = await fileService.showSaveDialog();
        }

        if (savePath) {
          await fileService.writeFile(savePath, markdown);

          set((state) => {
            const fileName = savePath.split(/[\\/]/).pop();
            const newTabs = state.tabs.map((tab) => {
              if (tab.id === state.activeTabId) {
                return {
                  ...tab,
                  id: savePath, // update ID to new path
                  fileName,
                  currentFilePath: savePath,
                  savedMarkdown: markdown,
                  isDirty: false,
                };
              }
              return tab;
            });
            return {
              tabs: newTabs,
              ...syncToRoot(newTabs, savePath), // new activeTabId is the new savePath
            };
          });

          const currentFolder = useWorkspaceStore.getState().currentFolder;
          if (currentFolder) {
            await useWorkspaceStore.getState().loadWorkspace(currentFolder);
          }

          logger.info(`Manually saved file to: ${savePath}`);
          toast.success("File saved!", { icon: "💾" });
        }
      } catch (err) {
        logger.error("Error during manual save", err);
        toast.error("Failed to save file");
      }
    },

    openFile: async (fullPath) => {
      try {
        const { tabs } = get();
        const existingTab = tabs.find(
          (t) => t.id === fullPath || t.currentFilePath === fullPath,
        );

        if (existingTab) {
          // Tab is already open, just switch to it
          get().setActiveTab(existingTab.id);
          return;
        }

        // Otherwise open it
        const content = await fileService.readFile(fullPath);
        const fileName = fullPath.split(/[\\/]/).pop();

        set((state) => {
          const newTab = {
            id: fullPath,
            fileName,
            currentFilePath: fullPath,
            markdown: content,
            savedMarkdown: content,
            isDirty: false,
          };

          // If we currently just have an empty untouched Untitled tab, replace it
          let newTabs = [...state.tabs];
          if (
            newTabs.length === 1 &&
            !newTabs[0].currentFilePath &&
            !newTabs[0].isDirty &&
            newTabs[0].markdown === WELCOME_CONTENT
          ) {
            newTabs = [newTab];
          } else {
            newTabs.push(newTab);
          }

          return {
            tabs: newTabs,
            ...syncToRoot(newTabs, fullPath),
          };
        });

        logger.info(`Opened file: ${fullPath}`);
      } catch (err) {
        logger.error(`Error reading file: ${fullPath}`, err);
        toast.error("Could not read the file");
      }
    },

    autoSaveFile: async () => {
      const { currentFilePath, markdown, activeTabId } = get();
      if (!currentFilePath) return;
      try {
        await fileService.writeFile(currentFilePath, markdown);
        set((state) => {
          const newTabs = state.tabs.map((tab) =>
            tab.id === state.activeTabId
              ? { ...tab, savedMarkdown: markdown, isDirty: false }
              : tab,
          );
          return { tabs: newTabs, ...syncToRoot(newTabs, state.activeTabId) };
        });
        logger.info(`Auto-saved file to: ${currentFilePath}`);
      } catch (err) {
        logger.error("Auto-save failed", err);
        toast.error("Auto-save failed!");
      }
    },
  };
});
