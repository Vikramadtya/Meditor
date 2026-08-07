import { create } from "zustand";

export const useUIStore = create((set) => ({
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
}));
