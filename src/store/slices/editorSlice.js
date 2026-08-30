/**
 * @fileoverview Editor slice — tabs, active file, markdown content.
 * All async file operations are delegated to DocumentService (not defined here).
 * This slice is purely state — setters and synchronous reducers only.
 */

const WELCOME_CONTENT =
  "# Welcome to meditor\n\nA beautiful, super lightweight markdown editor.\n\n## Features\n- Toggle between Edit and View mode\n- Folder navigation sidebar\n- Glassmorphism design";

/**
 * Syncs root editor state (markdown, fileName, etc.) from the active tab.
 * This enables backward-compatible access to `state.markdown` etc.
 * @param {Array} tabs
 * @param {string} activeTabId
 * @returns {Object}
 */
const syncFromActiveTab = (tabs, activeTabId) => {
  if (!tabs?.length) {
    return {
      markdown: "",
      savedMarkdown: "",
      isDirty: false,
      fileName: "",
      currentFilePath: null,
    };
  }
  const active =
    tabs.find((t) => t.id === activeTabId) ?? tabs[tabs.length - 1];
  return {
    markdown: active.markdown,
    savedMarkdown: active.savedMarkdown,
    isDirty: active.isDirty,
    fileName: active.fileName,
    currentFilePath: active.currentFilePath,
    activeTabId: active.id,
  };
};

const initialTab = {
  id: "Untitled.md",
  fileName: "Untitled.md",
  currentFilePath: null,
  markdown: WELCOME_CONTENT,
  savedMarkdown: WELCOME_CONTENT,
  isDirty: false,
};

export const WELCOME_MD = WELCOME_CONTENT;

export const createEditorSlice = (set, get) => ({
  tabs: [initialTab],
  activeTabId: "Untitled.md",
  ...syncFromActiveTab([initialTab], "Untitled.md"),

  // ── Content mutations ────────────────────────────────────────────────────
  setMarkdown: (markdown) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === s.activeTabId);
      if (tab) {
        tab.markdown = markdown;
        tab.isDirty = markdown !== tab.savedMarkdown;
      }
      Object.assign(s, syncFromActiveTab(s.tabs, s.activeTabId));
    }),

  setFileName: (fileName) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === s.activeTabId);
      if (tab) tab.fileName = fileName;
      Object.assign(s, syncFromActiveTab(s.tabs, s.activeTabId));
    }),

  setCurrentFilePath: (currentFilePath) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === s.activeTabId);
      if (tab) tab.currentFilePath = currentFilePath;
      Object.assign(s, syncFromActiveTab(s.tabs, s.activeTabId));
    }),

  markSaved: (path, content) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === s.activeTabId);
      if (tab) {
        const fileName = path.split(/[/\\]/).pop();
        tab.id = path;
        tab.currentFilePath = path;
        tab.fileName = fileName;
        tab.markdown = content;
        tab.savedMarkdown = content;
        tab.isDirty = false;
      }
      Object.assign(s, syncFromActiveTab(s.tabs, path));
    }),

  // ── Tab operations ───────────────────────────────────────────────────────
  setActiveTab: (tabId) =>
    set((s) => {
      Object.assign(s, syncFromActiveTab(s.tabs, tabId));
    }),

  openTab: (tab) =>
    set((s) => {
      const existing = s.tabs.find(
        (t) => t.id === tab.id || t.currentFilePath === tab.currentFilePath,
      );
      if (existing) {
        Object.assign(s, syncFromActiveTab(s.tabs, existing.id));
        return;
      }

      // Replace the empty welcome tab if it's the only one
      const isOnlyWelcome =
        s.tabs.length === 1 &&
        !s.tabs[0].currentFilePath &&
        !s.tabs[0].isDirty &&
        s.tabs[0].markdown === WELCOME_CONTENT;

      s.tabs = isOnlyWelcome ? [tab] : [...s.tabs, tab];
      Object.assign(s, syncFromActiveTab(s.tabs, tab.id));
    }),

  closeTab: (tabId) =>
    set((s) => {
      s.tabs = s.tabs.filter((t) => t.id !== tabId);
      if (s.tabs.length === 0) {
        const freshTab = { ...initialTab, id: `Untitled-${Date.now()}.md` };
        s.tabs = [freshTab];
      }
      const newActiveId =
        s.activeTabId === tabId ? s.tabs[s.tabs.length - 1].id : s.activeTabId;
      Object.assign(s, syncFromActiveTab(s.tabs, newActiveId));
    }),
});
