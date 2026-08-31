<div align="center">

# ✦ Meditor

**A beautiful, distraction-free Markdown editor for the desktop.**

_Write with focus. Preview with clarity._

![Meditor — Dark Mode](./public/app-icon.png)

[![Built with Neutralino.js](https://img.shields.io/badge/Desktop-Neutralino.js_v5.3-0ea5e9?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==)](https://neutralino.js.org)
[![React 19](https://img.shields.io/badge/UI-React_19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Build-Vite_8-646cff?style=flat-square&logo=vite)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-a3e635?style=flat-square)](./LICENSE)

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Architecture](#3-architecture)
4. [Design System](#4-design-system)
5. [Project Structure](#5-project-structure)
6. [Data Flow](#6-data-flow)
7. [Markdown Engine](#7-markdown-engine)
8. [Keyboard Shortcuts](#8-keyboard-shortcuts)
9. [Settings & Configuration](#9-settings--configuration)
10. [Development Guide](#10-development-guide)
11. [Deployment & Distribution](#11-deployment--distribution)
12. [Extending Meditor](#12-extending-meditor)

---

## 1. Overview

**Meditor** is a premium, distraction-free Markdown editor built as a native desktop application. It provides a Typora-like single-pane experience — seamlessly switching between a feature-rich _Edit_ mode and a beautifully styled _View_ mode without leaving the document.

Under the hood, Meditor is a thin Neutralino.js shell wrapping a React + Vite application. This architecture gives you the power and ecosystem of modern web tooling while keeping the binary footprint minimal — no Electron, no Chromium bundled, no 200 MB download.

**Core Philosophy:**

- **Zero friction** — open a folder, click a file, start writing.
- **Native feel** — borderless window, custom titlebar drag region, native file dialogs.
- **Offline first** — all state and content live on disk; no cloud required.
- **Extensible** — custom Markdown rules, typography controls, and a plugin-ready architecture.

---

## 2. Features

### Editor

| Feature                 | Description                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Edit / View Toggle**  | Single-pane switch between a full CodeMirror 6 editor and a rendered HTML preview       |
| **Split Mode**          | Side-by-side editor and live preview with synchronized scrolling                        |
| **Syntax Highlighting** | Full Markdown syntax highlighting with 100+ language grammar support in code fences     |
| **Vim Mode**            | Optional Vim keybindings, toggled from Settings                                         |
| **Bubble Menu**         | Context-sensitive formatting toolbar on text selection (bold, italic, code, link, etc.) |
| **Prettier Formatting** | One-key document formatting via Prettier (`⌘⇧F`)                                        |
| **Auto-save**           | Debounced 2-second auto-save whenever an open file is modified                          |
| **Drag & Drop Images**  | Drop images directly onto the editor; they are copied to a configurable path            |

### File Management

| Feature                         | Description                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- |
| **Workspace Folders**           | Open any local folder as a workspace; the sidebar shows folders and `.md` files |
| **File Creation**               | Create new `.md` files or sub-folders directly from the sidebar                 |
| **Back Navigation**             | Navigate parent directories with a `..` entry                                   |
| **Disk-backed Index Cache**     | Recursive directory scans are cached to disk for instant subsequent searches    |
| **Configurable Cache Location** | Cache defaults to `/tmp/meditor_cache` and can be changed in Settings           |

### Markdown Rendering

| Feature                      | Description                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **GitHub Flavored Markdown** | Full GFM support (tables, task lists, strikethrough) via `markdown-it`                                       |
| **Mermaid Diagrams**         | Renders flowcharts, sequence diagrams, ER diagrams, and more. SVGs are cached to eliminate re-render flashes |
| **MkDocs-style Tabs**        | Native `=== "Tab Name"` tab syntax rendered as interactive tabbed panels                                     |
| **Admonitions**              | MkDocs-compatible `!!!`, `???`, `???+` collapsible admonition blocks                                         |
| **KaTeX Math**               | Inline `$...$` and display `$$...$$` LaTeX math expressions                                                  |
| **Custom Rules**             | User-defined regex-to-HTML transformation rules with live CSS injection                                      |

### Search

| Feature                | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| **Global Search**      | Full-text search across every `.md` file in the workspace (`⌘⇧F`)     |
| **Context Snippets**   | Results include a 40-character context window around each match       |
| **Batched Processing** | Files searched in concurrent batches of 50 to prevent IPC bottlenecks |
| **Cached Index**       | Recursive file list cached on disk; re-indexed only when files change |

### Export

| Feature             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| **Export to HTML**  | Single-file HTML export with embedded styles                 |
| **Export to PDF**   | High-quality PDF via `html2pdf.js` with 2× canvas resolution |
| **Command Palette** | Unified command launcher (`⌘K`) for all actions              |

---

## 3. Architecture

Meditor is built on three distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                   Native OS Shell                        │
│              (Neutralino.js v5.3.0)                      │
│   - Borderless window, native title bar drag region     │
│   - File system access, native dialogs                  │
│   - App lifecycle events (windowClose, etc.)            │
└───────────────────────────┬─────────────────────────────┘
                            │ window.Neutralino API
┌───────────────────────────▼─────────────────────────────┐
│                 Web Application Layer                    │
│              (React 19 + Vite 8 + Zustand)               │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ fileStore│  │ uiStore  │  │   settingsStore       │  │
│  │ (zustand)│  │ (zustand)│  │   (zustand+persist)   │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │             │                   │               │
│  ┌────▼─────────────▼───────────────────▼───────────┐  │
│  │                 Component Tree                    │  │
│  │  App → [Titlebar, Sidebar, EditorPane, FAB,       │  │
│  │          SettingsModal, CommandPalette,            │  │
│  │          GlobalSearchModal]                       │  │
│  └───────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                   Service Layer                          │
│                                                         │
│   fileService.js   ─── All Neutralino FS operations     │
│   exportService.js ─── HTML/PDF rendering & download    │
│   logger.js        ─── Structured console wrapper       │
└─────────────────────────────────────────────────────────┘
```

### State Management

Meditor uses **Zustand** with three distinct stores, each with a clear, single responsibility:

| Store           | Persisted                  | Responsibility                                                                  |
| --------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `fileStore`     | ✗ (runtime only)           | Active file path, markdown content, dirty flag, workspace navigation, file CRUD |
| `uiStore`       | ✓ (theme, layout, sidebar) | Edit/View mode, split layout, sidebar open/close, all modal open states         |
| `settingsStore` | ✓ (all)                    | Markdown dialect, typography, custom rules, cache location                      |

---

## 4. Design System

Meditor uses a **Zinc Dark** design system — a refined, monochromatic dark palette with glassmorphism surface treatments.

### Color Palette

| Token              | Value                    | Usage                               |
| ------------------ | ------------------------ | ----------------------------------- |
| `--bg-primary`     | `#18181b`                | Main application background         |
| `--bg-secondary`   | `rgba(39, 39, 42, 0.7)`  | Sidebar, secondary surfaces         |
| `--bg-glass`       | `rgba(24, 24, 27, 0.7)`  | Floating panels, titlebar, modals   |
| `--text-primary`   | `#f4f4f5`                | Primary readable text               |
| `--text-secondary` | `#a1a1aa`                | Captions, labels, placeholders      |
| `--accent`         | `#3b82f6`                | Buttons, active states, focus rings |
| `--accent-hover`   | `#60a5fa`                | Interactive hover state             |
| `--border-color`   | `rgba(255,255,255,0.05)` | Dividers, structural borders        |
| `--glass-border`   | `rgba(255,255,255,0.03)` | Subtle glassmorphism borders        |

Light mode overrides all of the above with a **Pristine White** palette.

### Typography

Typography is fully runtime-configurable via CSS custom properties injected by `App.jsx`:

| CSS Variable          | Default              | Controls                          |
| --------------------- | -------------------- | --------------------------------- |
| `--prose-font`        | `'Inter', system-ui` | Prose reading font family         |
| `--prose-size`        | `17px`               | Base font size                    |
| `--prose-line-height` | `1.8`                | Line height multiplier            |
| `--prose-width`       | `none`               | Max prose column width (0 = full) |
| `--prose-h1`          | `2em`                | Heading scale relative to base    |

**Available Prose Fonts:**

- Inter (Default — clean, modern sans-serif)
- Georgia (Classic serif for long-form reading)
- Merriweather (Elegant serif with high legibility)
- Source Sans 3 (Humanist sans-serif)
- System Default

**Monospace:** `Fira Code` (loaded from Google Fonts) — used for all code blocks and the CodeMirror editor.

### Glassmorphism

Floating surfaces (titlebar, modals, command palette, floating action bar) use a consistent glassmorphism treatment:

```css
background: var(--bg-glass); /* Semi-transparent zinc */
backdrop-filter: blur(24px); /* Frosted glass blur */
border: 1px solid var(--glass-border); /* Hairline refraction */
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25); /* Premium depth */
```

### Motion & Micro-animations

All interactive state transitions use a consistent easing curve:

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Material Standard */
```

Applied to: sidebar collapse, mode fade, FAB hover lift, modal entry.

---

## 5. Project Structure

```
meditor/
├── public/                    # Static assets served by Neutralino
│   ├── app-icon.png           # App icon
│   ├── icons.svg              # Icon sprite
│   ├── neutralino.js          # Neutralino client library
│   └── neutralino.d.ts        # TypeScript types
│
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Root component & global effects
│   │
│   ├── components/            # UI Components
│   │   ├── EditorPane.jsx     # Core editor/preview split view
│   │   ├── Sidebar.jsx        # File tree navigation
│   │   ├── Titlebar.jsx       # Draggable native-feeling title bar
│   │   ├── FloatingActionBar.jsx # Mode/layout controls (FAB)
│   │   ├── CommandPalette.jsx # ⌘K fuzzy command launcher
│   │   ├── GlobalSearchModal.jsx # ⌘⇧F full-text file search
│   │   ├── BubbleMenu.jsx     # Selection formatting toolbar
│   │   ├── TableOfContents.jsx # Floating TOC from headings
│   │   ├── FrontmatterBlock.jsx # YAML frontmatter display
│   │   ├── ErrorBoundary.jsx  # React error boundary
│   │   └── Settings/          # Settings modal & tabs
│   │       ├── SettingsModal.jsx
│   │       ├── SettingsUI.jsx
│   │       ├── AppearanceTab.jsx
│   │       ├── TypographyTab.jsx
│   │       ├── MarkdownTab.jsx
│   │       ├── CustomRulesTab.jsx
│   │       └── SystemTab.jsx
│   │
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useMarkdown.js       # Markdown → HTML pipeline (singleton MD instance)
│   │   ├── useMermaidRenderer.js # Mermaid SVG rendering with cache
│   │   ├── useMkDocsTabs.js     # Tab click event delegation
│   │   ├── useScrollSync.js     # Split-pane scroll synchronization
│   │   ├── useImageInterceptor.js # Local image path → data-URL rewriting
│   │   ├── useDragAndDrop.js    # CodeMirror DnD image extension
│   │   └── useKeyboardShortcuts.js # Global ⌘S, ⌘K, ⌘E shortcuts
│   │
│   ├── store/                 # Zustand state stores
│   │   ├── fileStore.js        # File/workspace state + all async file actions
│   │   ├── uiStore.js          # UI toggle states (persisted: theme, layout)
│   │   └── settingsStore.js    # All settings (fully persisted)
│   │
│   ├── services/              # Platform-abstraction layer
│   │   ├── fileService.js      # All Neutralino filesystem/OS calls
│   │   ├── exportService.js    # HTML + PDF export
│   │   └── logger.js           # Structured logging wrapper
│   │
│   ├── utils/                 # Stateless utilities & plugins
│   │   ├── markdown-it-admonitions.js  # Custom MkDocs !!! / ??? parser
│   │   ├── markdown-it-mkdocs-tabs.js  # Custom === "Tab" block parser
│   │   ├── markdown-it-custom-rules.js # User-defined regex transform rules
│   │   └── editor/
│   │       └── slashCommands.js # CodeMirror / slash-command completions
│   │
│   └── styles/
│       ├── global.css          # Design tokens, body, titlebar, scrollbars
│       ├── Editor.css          # Prose, code blocks, tables, admonitions, tabs
│       ├── Sidebar.css         # Sidebar layout & file tree
│       └── Modals.css          # All modal surfaces (settings, palette, search)
│
├── index.html                 # Vite entry HTML
├── vite.config.js             # Vite build config
├── neutralino.config.json     # Desktop app window & binary config
└── package.json               # Dependencies & scripts
```

---

## 6. Data Flow

### Opening a File

```
User clicks file in Sidebar
    └─▶ fileStore.openFileFromSidebar(file)
        └─▶ fileService.readFile(fullPath)        [Neutralino FS]
            └─▶ set({ markdown, fileName, currentFilePath })
                └─▶ useMarkdown(markdown) re-runs [100ms debounce]
                    └─▶ markdown-it.render(content)
                        └─▶ DOMPurify.sanitize(rawHtml)
                            └─▶ setHtmlContent(cleanHtml)
                                └─▶ EditorPane re-renders
                                    └─▶ useMermaidRenderer: SVG cache hit → inject instantly
```

### Auto-save

```
User types in CodeMirror
    └─▶ setMarkdown(newValue) → isDirty = true
        └─▶ App.jsx useEffect [debounced 2s]
            └─▶ fileStore.autoSaveFile()
                └─▶ fileService.writeFile(currentFilePath, markdown)
                    └─▶ set({ savedMarkdown, isDirty: false })
```

### Global Search

```
User opens ⌘⇧F → types query
    └─▶ fileService.searchInFiles(workspaceRoot, query)
        ├─▶ fileService.readDirectoryRecursive(path)  [disk-cached index]
        └─▶ Batch 50 files concurrently with Promise.all
            └─▶ Each file: readFile → indexOf(query) → extract snippet
                └─▶ Returns [{filePath, snippet}, ...]
                    └─▶ User clicks result → openFileFromSidebar
```

---

## 7. Markdown Engine

Meditor uses **`markdown-it`** as the core parser, configured in `useMarkdown.js`. A singleton instance is maintained across renders and only recreated when the settings configuration changes.

### Plugin Pipeline

Plugins are applied in order:

```
markdown-it (GFM preset)
    ├─▶ markdown-it-task-lists   — GFM task list items [ ] [x]
    ├─▶ markdown-it-katex        — LaTeX math $...$ / $$...$$
    ├─▶ admonitionPlugin         — Custom MkDocs !!! / ??? parser
    ├─▶ markdownItMkDocsTabs     — Custom === "Tab" block parser
    └─▶ customRulesPlugin        — User-defined regex transforms
```

### Custom Plugins

#### `markdown-it-admonitions.js`

A ground-up implementation of the MkDocs admonition spec supporting:

- `!!! type "Title"` — Static admonition div
- `??? type "Title"` — Collapsible `<details>` block (closed)
- `???+ type "Title"` — Collapsible `<details>` block (open)

Content indented by **4 spaces** is parsed as the admonition body, allowing any block-level Markdown inside (including code fences and Mermaid diagrams).

#### `markdown-it-mkdocs-tabs.js`

A block-level rule that parses MkDocs tab syntax:

```markdown
=== "Tab One"
Content for tab one.
Any Markdown here.

=== "Tab Two"
Content for tab two.
```

The parser uses indentation (4 spaces) as the block boundary. Consecutive `===` blocks are grouped into a single tab group in the core rule phase. The result is a `<div class="mkdocs-tabs">` with a nav bar and hidden pane structure, activated by the `useMkDocsTabs` click handler.

### Mermaid Rendering (`useMermaidRenderer.js`)

Mermaid diagrams go through a special pipeline to avoid flashing:

1. `useLayoutEffect` fires synchronously before the browser paints.
2. For each `<code class="language-mermaid">` node found in the DOM:
   - **Cache hit:** The raw text is looked up in a module-level `Map`. The cached SVG is injected synchronously, replacing the `<pre>` block — **zero flash**.
   - **Cache miss:** The render is queued through a sequential `Promise` chain (to prevent Mermaid's internal concurrent-render errors). On success, the SVG is stored in the cache for future renders.

### DOMPurify Sanitization

Rendered HTML is passed through `DOMPurify.sanitize()` with a carefully curated allowlist to prevent XSS while preserving all required attributes:

```js
DOMPurify.sanitize(rawHtml, {
  ADD_ATTR: ["target", "className", "class", "data-tab-idx"],
});
```

`data-tab-idx` is explicitly whitelisted so the MkDocs tab click handler can correctly identify which pane to activate.

---

## 8. Keyboard Shortcuts

| Shortcut              | Action                                       |
| --------------------- | -------------------------------------------- |
| `⌘ S`                 | Save the active file                         |
| `⌘ E`                 | Toggle Edit / View mode                      |
| `⌘ K`                 | Open the Command Palette                     |
| `⌘ ⇧ F`               | Open Global Search                           |
| `⌘ ⇧ F` _(in editor)_ | Format document with Prettier                |
| `⌘ C / X / V`         | Copy / Cut / Paste (native WebView fallback) |
| `⌘ A`                 | Select All                                   |
| `⌘ Z / ⌘ ⇧ Z`         | Undo / Redo                                  |

> **Note:** All global shortcuts use the capture phase (`{ capture: true }`) so they fire before CodeMirror or other focused elements can consume the event.

---

## 9. Settings & Configuration

Access Settings via the gear icon in the Floating Action Bar or via the Command Palette.

### Appearance Tab

- **Theme:** Switch between Dark (Zinc) and Light (Pristine White) modes.

### Typography Tab

- **Prose Font:** Choose from Inter, Georgia, Merriweather, Source Sans 3, or System Default.
- **Font Size:** Base reading size in pixels (default: 17px).
- **Line Height:** Multiplier for prose line spacing (default: 1.8).
- **Prose Width:** Max column width in pixels; 0 fills the available pane.
- **Heading Scales:** Independent `em` scale for H1–H4.
- **Table Style:** `minimal`, `bordered`, or `striped`.

### Markdown Tab

- **Dialect:** GFM (default) or CommonMark.
- **HTML in Markdown:** Allow raw HTML passthrough.
- **Linkify:** Auto-link bare URLs.
- **Typographer:** Smart quotes, em/en dashes.
- **Image Save Path:** Default relative folder when pasting/dropping images.
- **Vim Mode:** Enable Vim keybindings in the CodeMirror editor.

### Custom Rules Tab

Create user-defined Markdown transformation rules:

- **Regex:** Pattern to match in raw Markdown text.
- **HTML Template:** Replacement HTML with `$1`, `$2` capture group placeholders.
- **CSS:** Scoped CSS injected directly into `<head>` at runtime.

### System Tab

- **Cache Location:** Configure where the recursive directory index files are stored. Defaults to `/tmp/meditor_cache`. Can be changed to any accessible path on disk.

All settings are **fully persisted** in `localStorage` under the key `meditor-settings` and survive application restarts.

---

## 10. Development Guide

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Neutralino CLI** (`neu`) ≥ 5.3

```bash
npm install -g @neutralinojs/neu
```

### Install Dependencies

```bash
git clone https://github.com/Vikramadtya/Meditor.git
cd Meditor
npm install
npx @neutralinojs/neu update   # Downloads the correct Neutralino binaries
```

### Development Server

For rapid iteration, run the Vite dev server and the Neutralino shell separately:

```bash
# Terminal 1 — Vite hot-reload dev server
npm run dev

# Terminal 2 — Neutralino native shell (connects to Vite on port 5173)
npx @neutralinojs/neu run
```

> Changes to React source files will hot-reload instantly via Vite's HMR. Neutralino-specific configuration changes require a restart.

### Linting

```bash
npm run lint      # oxlint — fast Rust-based linter
```

Code style is enforced on commit via `husky` + `lint-staged`:

- **`*.{js,jsx}`**: `prettier --write` + `oxlint`
- **`*.{json,css,md}`**: `prettier --write`

### Building for Production

```bash
# Step 1: Build the Vite React bundle into /dist
npm run build

# Step 2: Bundle /dist + Neutralino binaries into the /build directory
npx @neutralinojs/neu build
```

The final app is located at `./build/`. On macOS this produces `Meditor.app`.

> **Important:** `resources.neu` is generated during `neu build` and bundles all assets. Any change to source files requires both steps to be reflected in the distributed binary.

---

## 11. Deployment & Distribution

### Build Artifacts

After running the build pipeline, the `./build/` directory contains the distributable application:

```
build/
├── Meditor.app           # macOS Application Bundle (.app)
├── Meditor-*.dmg         # macOS Disk Image (optional, codesigned)
└── ...                   # Windows/Linux equivalents
```

### Platform Targets

Neutralino produces self-contained binaries for all platforms. The `./bin/` directory contains pre-downloaded platform binaries:

| File                       | Target                              |
| -------------------------- | ----------------------------------- |
| `neutralino-mac_arm64`     | Apple Silicon (M1/M2/M3)            |
| `neutralino-mac_x64`       | Intel macOS                         |
| `neutralino-mac_universal` | Universal macOS binary (both archs) |
| `neutralino-linux_x64`     | Linux x86-64                        |
| `neutralino-linux_arm64`   | Linux ARM64                         |
| `neutralino-win_x64.exe`   | Windows x64                         |

### macOS Distribution

For distribution outside the Mac App Store, the app should be code-signed and notarized:

```bash
# Sign the application
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAMID)" \
  build/Meditor.app

# Create a signed DMG
hdiutil create -volname "Meditor" \
  -srcfolder build/Meditor.app \
  -ov -format UDZO build/Meditor.dmg

# Notarize (requires Apple Developer account)
xcrun notarytool submit build/Meditor.dmg \
  --apple-id "your@email.com" \
  --team-id "TEAMID" \
  --password "app-specific-password" \
  --wait
```

### Windows Distribution

On Windows, package as an installer using NSIS or Inno Setup, or distribute the raw directory from `./build/` as a zip archive.

### Linux Distribution

Wrap the binary in a `.desktop` file and distribute as an AppImage or Flatpak for broad compatibility:

```bash
# Example AppImage wrapping (using appimagetool)
cp bin/neutralino-linux_x64 Meditor.AppDir/AppRun
appimagetool Meditor.AppDir Meditor-x86_64.AppImage
```

### Window Configuration (`neutralino.config.json`)

| Setting                | Value                       | Description                        |
| ---------------------- | --------------------------- | ---------------------------------- |
| `defaultMode`          | `window`                    | Native desktop window              |
| `width / height`       | `1000 × 700`                | Default startup size               |
| `minWidth / minHeight` | `600 × 400`                 | Minimum resizable size             |
| `borderlessWindow`     | `true`                      | Frameless window (custom titlebar) |
| `tokenSecurity`        | `one-time`                  | Rotating auth token per session    |
| `nativeAllowList`      | `app.*, os.*, filesystem.*` | Whitelisted Neutralino APIs        |

---

## 12. Extending Meditor

### Adding a Custom Markdown Plugin

1. Create `src/utils/markdown-it-your-plugin.js` following the `markdown-it` plugin API.
2. Import and register it in `src/hooks/useMarkdown.js`:

```js
import yourPlugin from "../utils/markdown-it-your-plugin";
// ...
parser.use(yourPlugin, {/* options */});
```

### Adding a New Keyboard Shortcut

Open `src/hooks/useKeyboardShortcuts.js` and add a `case` to the `switch` statement:

```js
case "m":
  e.preventDefault();
  // your action here
  break;
```

### Adding a New Settings Tab

1. Create `src/components/Settings/YourTab.jsx`.
2. Register it in `src/components/Settings/SettingsModal.jsx` alongside the existing tab definitions.
3. Add any new state fields to `settingsStore.js`.

### Custom Rules (No Code Required)

For simple Markdown transformations, use the **Custom Rules** tab in Settings. Rules are regex-based, support capture groups, and accept arbitrary CSS — no rebuild required.

---

<div align="center">

Made with ♥ by [Vikramaditya Singh](https://github.com/Vikramadtya)

_Built on the shoulders of giants:_
[Neutralino.js](https://neutralino.js.org) · [React](https://react.dev) · [CodeMirror 6](https://codemirror.net) · [markdown-it](https://markdown-it.github.io) · [Mermaid](https://mermaid.js.org) · [Zustand](https://zustand-demo.pmnd.rs) · [Vite](https://vite.dev)

</div>

---

## 13. Troubleshooting & Debugging

If Meditor behaves unexpectedly, crashes, or fails to render, use the following resources to debug.

### How to Find the Logs

Meditor uses a structured logging system (`Logger.forContext()`) that writes to two places:

1. **Browser Console:**
   Right-click anywhere in the Meditor window and select **Inspect Element** (or press \`Cmd + Option + I\`). Open the **Console** tab to view real-time frontend logs, React errors, and warnings.

2. **Disk Log File:**
   Meditor persists all application logs (`INFO`, `WARN`, `ERROR`) to a persistent log file on your system.
   - **macOS:** `~/Library/Application Support/meditor/meditor.log` (or within the folder returned by your OS for Application Data).
   - **Windows:** `%APPDATA%\\meditor\\meditor.log`
   - **Linux:** `~/.config/meditor/meditor.log`

   _Note: If the application cannot write to the OS Data directory, it may fail silently. Check the Developer Console first._

### How to Debug Issues (Detailed Guide)

When investigating a bug, follow this workflow:

1. **Check the React Console:**
   - Open Developer Tools (`Cmd + Option + I`).
   - Check the **Console** for uncaught JavaScript exceptions (e.g., `TypeError: null is not an object`).
   - Look for Meditor-specific context logs (e.g., `[ERROR] [VaultService] Failed to load SQLite database`).

2. **Inspect the UI State (Zustand):**
   - Meditor's state is centrally managed via Zustand. You can inspect the current global state by typing `useStore.getState()` in the Console.
   - Verify `currentFolder`, `workspaceMode`, and `activeVaultItem` are set to what you expect.

3. **Check the SQLite Vault Database:**
   - If running in Vault Mode, check if the `vault.db` file in the root of your workspace is corrupted.
   - You can open the `vault.db` file using any SQLite browser (like DB Browser for SQLite) to verify that the `groups`, `collections`, `modules`, and `notes` tables exist and contain correct references.

4. **Verify File Permissions:**
   - Meditor requires read/write access to your workspace folder. If saving fails, ensure the directory permissions allow writing.

5. **Hot-Reloading in Dev Mode:**
   - If you are developing and hit a bug, run the app in Vite dev mode (`npm run dev`) and Neutralino dev mode (`npx @neutralinojs/neu run`).
   - The Vite dev server will print build and syntax errors directly to Terminal 1.
   - Neutralino backend logs (C++ server errors) will be printed to Terminal 2.

### macOS App Deployment

Meditor provides a fully automated build script for macOS that compiles the React app, bundles it with Neutralino, assigns the App Icon, sets up the `Info.plist`, and wraps everything into a distributable Disk Image (`.dmg`).

To build and package for macOS:

```bash
# Make sure the script is executable
chmod +x build-mac.sh

# Run the build script
./build-mac.sh
```

**What this script does:**

1. Runs `npm run build` to compile the Vite + React frontend into `/dist`.
2. Runs `npx @neutralinojs/neu build` to package the frontend and the Neutralino binaries.
3. Creates a `.app` bundle structure in `/build/Meditor.app`.
4. Copies the Universal macOS binary (`meditor-mac_universal`) and the resource bundle (`resources.neu`) into the `.app`.
5. Uses `sips` and `iconutil` to generate the `.icns` file from `public/app-icon.png`.
6. Generates a standard Apple `Info.plist`.
7. Packages the `.app` into a `.dmg` file in the `/build/` directory using `hdiutil`.

You can now share the generated `build/Meditor-[version].dmg` file with others!
