/**
 * Selects the currently active tab object.
 * @param {Object} state - The global state.
 * @returns {Object|null} The active tab object.
 */
export const selectActiveTab = (state) =>
  state.tabs?.find((t) => t.id === state.activeTabId) ?? null;

/**
 * Selects whether the current active file has unsaved changes.
 * @param {Object} state - The global state.
 * @returns {boolean} True if dirty.
 */
export const selectIsDirty = (state) => state.isDirty;
