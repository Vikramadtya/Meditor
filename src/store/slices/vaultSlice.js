/**
 * @fileoverview Vault slice — workspace mode, file tree, active vault item.
 * Pure state mutations only. Async operations live in workspaceStore actions.
 */

export const createVaultSlice = (set, _get) => ({
  workspaceMode: "none",
  workspaceRoot: null,
  currentFolder: null,
  files: [],
  vaultHierarchy: [],
  activeVaultItem: null,

  setWorkspaceMode: (mode) =>
    set((s) => {
      s.workspaceMode = mode;
    }),
  setWorkspaceRoot: (root) =>
    set((s) => {
      s.workspaceRoot = root;
    }),
  setCurrentFolder: (folder) =>
    set((s) => {
      s.currentFolder = folder;
    }),
  setFiles: (files) =>
    set((s) => {
      s.files = files;
    }),
  setVaultHierarchy: (hierarchy) =>
    set((s) => {
      s.vaultHierarchy = hierarchy;
    }),
  setActiveVaultItem: (item) =>
    set((s) => {
      s.activeVaultItem = item;
    }),
});
