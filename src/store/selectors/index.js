/**
 * @fileoverview Centralized Zustand selectors for derived state.
 * Using selectors prevents components from recomputing the same logic independently.
 * Pattern: Selector functions receive the full store state and return derived values.
 */

/**
 * Whether the vault dashboard should be shown instead of the editor.
 * Encapsulates the showDashboard logic that was previously duplicated across components.
 * @param {Object} state - Full store state
 * @returns {boolean}
 */
export const selectShowDashboard = (state) =>
  state.workspaceMode === "vault" &&
  (!state.activeVaultItem || state.activeVaultItem.type !== "note");

/**
 * Whether the current open note is a vault note (not a plain folder file).
 * @param {Object} state
 * @returns {boolean}
 */
export const selectIsVaultNote = (state) =>
  state.workspaceMode === "vault" && state.activeVaultItem?.type === "note";

/**
 * Returns the currently active tab object.
 * @param {Object} state
 * @returns {Object|null}
 */
export const selectActiveTab = (state) =>
  state.tabs?.find((t) => t.id === state.activeTabId) ?? null;

/**
 * Whether the active file has unsaved changes.
 * @param {Object} state
 * @returns {boolean}
 */
export const selectIsDirty = (state) => state.isDirty;

/**
 * The repository root path (vault root or current folder).
 * @param {Object} state
 * @returns {string|null}
 */
export const selectRepoPath = (state) =>
  state.workspaceRoot ?? state.currentFolder ?? null;
