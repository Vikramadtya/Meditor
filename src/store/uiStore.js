import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      isEditMode: true,
      toggleMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

      viewLayout: "single", // 'single' | 'split'
      toggleLayout: () =>
        set((state) => ({
          viewLayout: state.viewLayout === "single" ? "split" : "single",
        })),

      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

      theme: "dark",
      setTheme: (theme) => set({ theme }),

      isTocOpen: false,
      setTocOpen: (isOpen) => set({ isTocOpen: isOpen }),
      toggleToc: () => set((state) => ({ isTocOpen: !state.isTocOpen })),

      isCmdPaletteOpen: false,
      setCmdPaletteOpen: (isOpen) => set({ isCmdPaletteOpen: isOpen }),

      isGlobalSearchOpen: false,
      setGlobalSearchOpen: (isOpen) => set({ isGlobalSearchOpen: isOpen }),

      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "meditor-ui", // key in localStorage
      partialize: (state) => ({
        theme: state.theme,
        viewLayout: state.viewLayout,
        isSidebarOpen: state.isSidebarOpen,
      }), // only persist specific fields so modals don't reopen on launch
    },
  ),
);
