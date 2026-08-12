import { create } from "zustand";

// All supported prose fonts (Google Fonts, loaded in global.css)
export const PROSE_FONTS = [
  { label: "Inter (Default)", value: "'Inter', system-ui, sans-serif" },
  { label: "Georgia (Serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Merriweather (Serif)", value: "'Merriweather', Georgia, serif" },
  { label: "Source Sans 3", value: "'Source Sans 3', system-ui, sans-serif" },
  { label: "System Default", value: "system-ui, sans-serif" },
];

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

  // --- Custom Markdown Rules ---
  customRules: [
    {
      id: "demo-math-de",
      name: "Custom Math Demo ($$de$$)",
      regex: "\\$\\$de\\$\\$(.*?)\\$\\$de\\$\\$",
      htmlTemplate: "<span class='custom-math-de'>$1</span>",
      css: ".custom-math-de {\n  color: #ff9100;\n  font-weight: 600;\n  font-family: monospace;\n  background: rgba(255, 145, 0, 0.1);\n  padding: 0 4px;\n  border-radius: 4px;\n}",
    },
  ],
  setCustomRules: (rules) => {
    set({ customRules: rules });
  },

  // ── Typography / Appearance ───────────────────────────────────────
  typography: {
    // Prose display font
    proseFont: "'Inter', system-ui, sans-serif",
    // Base reading font size (px)
    fontSize: 17,
    // Line height multiplier
    lineHeight: 1.8,
    // Max width of the prose column (px) — 0 means fill available width
    proseWidth: 0,
    // Heading scale: multipliers relative to base fontSize
    h1Scale: 2.0,
    h2Scale: 1.5,
    h3Scale: 1.25,
    h4Scale: 1.1,
    // Tables: "minimal" | "bordered" | "striped"
    tableStyle: "bordered",
  },
  setTypography: (patch) =>
    set((state) => ({
      typography: { ...state.typography, ...patch },
    })),
}));
