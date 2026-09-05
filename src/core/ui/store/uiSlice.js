/**
 * @fileoverview UI state slice — theme, sidebar, modals, layout.
 * Pure state: no async operations or service calls here.
 */

/**
 * Creates the UI state slice.
 *
 * @param {Function} set - Zustand set function.
 * @returns {Object} The UI state slice.
 */
export const createUISlice = (set) => ({
  // ── Editor UI ───────────────────────────────────────────────────────────
  isEditMode: false,
  toggleMode: () =>
    set((s) => {
      s.isEditMode = !s.isEditMode;
    }),

  viewLayout: "single",
  toggleLayout: () =>
    set((s) => {
      s.viewLayout = s.viewLayout === "single" ? "split" : "single";
    }),

  isTocOpen: false,
  setTocOpen: (v) =>
    set((s) => {
      s.isTocOpen = v;
    }),
  toggleToc: () =>
    set((s) => {
      s.isTocOpen = !s.isTocOpen;
    }),

  isSidebarOpen: true,
  toggleSidebar: () =>
    set((s) => {
      s.isSidebarOpen = !s.isSidebarOpen;
    }),

  // ── Theme ────────────────────────────────────────────────────────────────
  theme: "light",
  setTheme: (theme) =>
    set((s) => {
      s.theme = theme;
    }),

  // ── Modals ───────────────────────────────────────────────────────────────
  confirmDeleteModal: { isOpen: false, item: null },
  openConfirmDeleteModal: (item) => set((s) => { s.confirmDeleteModal = { isOpen: true, item }; }),
  closeConfirmDeleteModal: () => set((s) => { s.confirmDeleteModal = { isOpen: false, item: null }; }),
  
  isSettingsOpen: false,
  setSettingsOpen: (v) =>
    set((s) => {
      s.isSettingsOpen = v;
    }),

  isCmdPaletteOpen: false,
  setCmdPaletteOpen: (v) =>
    set((s) => {
      s.isCmdPaletteOpen = v;
    }),
  setCommandPaletteOpen: (v) =>
    set((s) => {
      s.isCmdPaletteOpen = v;
    }), // alias

  isGlobalSearchOpen: false,
  setGlobalSearchOpen: (v) =>
    set((s) => {
      s.isGlobalSearchOpen = v;
    }),

  isTrashModalOpen: false,
  setTrashModalOpen: (v) =>
    set((s) => {
      s.isTrashModalOpen = v;
    }),

  isGraphModalOpen: false,
  setGraphModalOpen: (v) =>
    set((s) => {
      s.isGraphModalOpen = v;
    }),

  setStatsModalOpen: (v) =>
    set((s) => {
      s.isStatsModalOpen = v;
    }),

  isGitModalOpen: false,
  setGitModalOpen: (v) =>
    set((s) => {
      s.isGitModalOpen = v;
    }),

  isHistoryModalOpen: false,
  setHistoryModalOpen: (v) =>
    set((s) => {
      s.isHistoryModalOpen = v;
    }),

  isTagModalOpen: false,
  setTagModalOpen: (v) =>
    set((s) => {
      s.isTagModalOpen = v;
    }),

  isFlashcardModalOpen: false,
  setFlashcardModalOpen: (v) =>
    set((s) => {
      s.isFlashcardModalOpen = v;
    }),

  // Create vault item modal
  createVaultItemModal: { isOpen: false, type: null, parentId: null },
  openCreateVaultItemModal: (type, parentId, editItem = null) =>
    set((s) => {
      s.createVaultItemModal = { isOpen: true, type, parentId, editItem };
    }),
  closeCreateVaultItemModal: () =>
    set((s) => {
      s.createVaultItemModal = {
        isOpen: false,
        type: null,
        parentId: null,
        editItem: null,
      };
    }),
});
