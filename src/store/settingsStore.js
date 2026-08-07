import { create } from "zustand";

export const useSettingsStore = create((set) => ({
  mdConfig: {
    dialect: "gfm",
    allowHtml: true,
    linkify: true,
    typographer: true,
    imageSavePath: "./images",
    vimMode: false,
  },
  setMdConfig: (newConfig) =>
    set((state) => ({ mdConfig: { ...state.mdConfig, ...newConfig } })),
}));
