/**
 * Selects whether to show the dashboard.
 * @param {Object} state - The global state.
 * @returns {boolean} True if in vault mode and no note is active.
 */
export const selectShowDashboard = (state) =>
  state.workspaceMode === "vault" &&
  (!state.activeVaultItem || state.activeVaultItem.type !== "note");

/**
 * Selects whether a vault note is currently active.
 * @param {Object} state - The global state.
 * @returns {boolean} True if in vault mode and a note is active.
 */
export const selectIsVaultNote = (state) =>
  state.workspaceMode === "vault" && state.activeVaultItem?.type === "note";

/**
 * Selects the repository root path.
 * @param {Object} state - The global state.
 * @returns {string|null} The path to the repository root.
 */
export const selectRepoPath = (state) =>
  state.workspaceRoot ?? state.currentFolder ?? null;
