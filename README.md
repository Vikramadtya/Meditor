<div align="center">
  <h1>📝 Meditor</h1>
  <p>A beautiful, lightweight, and feature-rich Markdown editor for macOS — built with React, CodeMirror, and Neutralino.js.</p>
</div>

---

## ✨ Features

- **Split-Pane Live Preview** — Write and see rendered output side-by-side, or toggle between Edit and View mode
- **Advanced Markdown** — Full GFM support with task lists, KaTeX math, Mermaid diagrams, and YAML frontmatter
- **Slash Commands** — Type `/h1`, `/table`, `/mermaid`, `/code` inside the editor for instant completions
- **Drag & Drop Images** — Drag an image file into the editor to automatically save it to your workspace and insert the markdown
- **Export to PDF / HTML** — Export your document directly from the toolbar
- **Auto-Formatting** — Press `Cmd+Shift+F` to instantly format your document with Prettier
- **Vim Mode** — Enable classic Vim keybindings in Settings
- **YAML Frontmatter** — Displayed as a clean metadata grid above the preview
- **Table of Contents** — Auto-generated from your document headings
- **Command Palette** — Quick-access panel for all actions (`Cmd+K`)
- **Dark / Light Theme** — Toggle via the toolbar
- **Persistent Logging** — All events are appended to `meditor.log` in your system data folder for easy debugging

---

## 🗂 Project Structure

```
meditor/
├── .github/
│   └── workflows/
│       └── build-mac.yml        # CI pipeline — builds & packages the macOS DMG
├── public/
│   ├── app-icon.png             # Application icon
│   └── neutralino.js            # Neutralino client-side bridge library
├── src/
│   ├── components/              # UI Components
│   │   ├── EditorPane.jsx       # Main editor + preview pane (the central hub)
│   │   ├── Sidebar.jsx          # File browser
│   │   ├── Titlebar.jsx         # Custom macOS titlebar with drag region
│   │   ├── CommandPalette.jsx   # Cmd+K quick-access panel
│   │   ├── SettingsModal.jsx    # Settings (Vim mode, theme, image path, etc.)
│   │   ├── FloatingActionBar.jsx  # Bottom toolbar (mode toggle, export, search)
│   │   ├── TableOfContents.jsx  # Auto-generated TOC panel
│   │   ├── FrontmatterBlock.jsx # YAML metadata display grid
│   │   └── ErrorBoundary.jsx    # Global crash-handler with stack trace UI
│   ├── hooks/                   # Custom React Hooks (single-responsibility)
│   │   ├── useMarkdown.js       # Parses markdown → HTML + TOC + frontmatter
│   │   ├── useScrollSync.js     # Syncs scroll position between editor & preview
│   │   ├── useDragAndDrop.js    # Handles image drop-and-save into CodeMirror
│   │   ├── useImageInterceptor.js  # Resolves local <img> paths via native FS
│   │   ├── useMermaidRenderer.js   # Post-processes HTML to render Mermaid graphs
│   │   └── useKeyboardShortcuts.js # Global keyboard shortcut bindings
│   ├── store/                   # Zustand global state slices
│   │   ├── fileStore.js         # Active file, markdown content, current folder
│   │   ├── uiStore.js           # Theme, edit/view mode, layout (split/toggle)
│   │   └── settingsStore.js     # Markdown parser config (Vim, linkify, etc.)
│   ├── services/                # Abstracted native integrations
│   │   ├── fileService.js       # All Neutralino filesystem & OS API calls
│   │   └── logger.js            # Structured logger — writes to console + disk
│   ├── workers/
│   │   └── markdownWorker.js    # (Reserved) Web Worker for background parsing
│   ├── styles/                  # Vanilla CSS stylesheets
│   │   ├── global.css           # Design system tokens, typography, layout
│   │   ├── Editor.css           # Editor & preview pane styles (prose, mermaid)
│   │   ├── Sidebar.css          # Sidebar & file tree styles
│   │   └── Modals.css           # Command palette & settings modal styles
│   ├── App.jsx                  # Root layout — wires Sidebar + EditorPane + Titlebar
│   └── main.jsx                 # React entry point — wraps <App> in <ErrorBoundary>
├── build-mac.sh                 # Local script to build & package a macOS .app + .dmg
├── neutralino.config.json       # Neutralino runtime configuration
├── vite.config.js               # Vite bundler config
└── package.json
```

---

## 🚀 Onboarding: Getting Started

### Prerequisites

| Tool        | Version    | Notes                          |
| ----------- | ---------- | ------------------------------ |
| **Node.js** | `>= 20`    | [Download](https://nodejs.org) |
| **npm**     | `>= 10`    | Comes with Node.js             |
| **macOS**   | `>= 10.13` | Required for DMG packaging     |

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/meditor.git
cd meditor
```

### 2. Install Dependencies

```bash
npm install
```

This also sets up the **Husky** Git hooks, which automatically run Prettier and OXLint before every commit to keep the codebase pristine.

### 3. Run in Development Mode

Launches a Vite dev server in the browser with HMR.

> ⚠️ **Note:** Neutralino native APIs (filesystem, OS dialogs, drag-and-drop) are **not** available in browser dev mode.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Run as a Native Desktop App

This gives you the full application experience with all native APIs available.

```bash
# 1. Build the Vite frontend
npm run build

# 2. Launch via Neutralino runtime
npx @neutralinojs/neu run
```

---

## 📦 Building & Packaging

### Local macOS Build (DMG)

Run the included build script to produce a fully packaged `Meditor.dmg`:

```bash
./build-mac.sh
```

This script will automatically:

1. Build the Vite frontend (`npm run build`)
2. Bundle the Neutralino app (`npx @neutralinojs/neu build`)
3. Generate a multi-resolution `icon.icns` from `public/app-icon.png`
4. Assemble a proper macOS `.app` bundle with `Contents/MacOS/`, `Contents/Resources/`, and a valid `Info.plist`
5. Compress everything into a distributable `Meditor.dmg` using the native `hdiutil` tool

The final file will be at:

```
build/Meditor.dmg
```

> **To install:** Double-click `Meditor.dmg`, then drag `Meditor.app` into your **Applications** folder.

---

### CI Pipeline (GitHub Actions)

The pipeline at `.github/workflows/build-mac.yml` automatically runs on every push or pull request to `main`. It can also be triggered manually from the **Actions** tab.

**Pipeline steps:**

1. Checks out the code on a `macos-latest` GitHub runner
2. Sets up Node.js 20 with `npm` cache for fast installs
3. Installs dependencies with `npm ci` (reproducible, lockfile-based)
4. Runs `./build-mac.sh` to compile, bundle, and package the app
5. Uploads `build/Meditor.dmg` as a downloadable GitHub Actions artifact

**Downloading a build artifact:**

1. Go to the **Actions** tab in your GitHub repository
2. Click on a successful workflow run
3. Scroll to the **Artifacts** section
4. Download `Meditor-macOS`

---

## 🔑 Keyboard Shortcuts

| Shortcut      | Action                             |
| ------------- | ---------------------------------- |
| `Cmd+K`       | Open Command Palette               |
| `Cmd+S`       | Save current file                  |
| `Cmd+Shift+F` | Auto-format document with Prettier |
| `Cmd+P`       | Open a file from the workspace     |
| `Cmd+\`       | Toggle Sidebar                     |

---

## 🐛 Debugging

### In-App Crash Handler

If a React rendering error occurs anywhere in the component tree, the **ErrorBoundary** catches it gracefully and displays a full stack trace inside the app instead of a blank white screen. Click **"Reload App"** to recover without restarting.

### Browser DevTools (Dev Mode)

When running with `npm run dev`, open the browser DevTools (`F12` or `Cmd+Option+I`) for the standard Console, Network, and React Component inspector.

### Native App DevTools (Inspector)

The native Neutralino window has the DevTools inspector enabled by default. Right-click anywhere in the app and select **"Inspect"** to open the full Chrome DevTools panel within the running app.

> To disable the inspector in a production release, set `"enableInspector": false` in `neutralino.config.json`.

### Persistent Log File

Every `logger.info`, `logger.warn`, and `logger.error` call is both printed to the DevTools console **and** asynchronously appended to a log file on disk. This is extremely useful for debugging issues that happen in the packaged `.app` where DevTools may not be accessible.

**Log file location (macOS):**

```
~/Library/Application Support/meditor.log
```

**Tail the log in real-time:**

```bash
tail -f ~/Library/Application\ Support/meditor.log
```

**Log format:**

```
[2026-08-07T11:04:21.123Z] [INFO]  App initialized successfully
[2026-08-07T11:04:25.456Z] [WARN]  Could not load local image: ./screenshot.png
[2026-08-07T11:04:30.789Z] [ERROR] Prettier error SyntaxError: unexpected token
```

### Neutralino Internal Log

Neutralino also maintains its own internal log at:

```
.tmp/storage/neutralino.log
```

This is useful for debugging native API crashes such as filesystem permission errors or OS API failures.

---

## 🛠 Development Workflow

### Linting

```bash
npm run lint
```

Runs [OXLint](https://oxc.rs/docs/guide/usage/linter.html) across all source files. Reports React hook dependency issues, unused variables, and more.

### Formatting

The Husky pre-commit hook runs Prettier automatically on every `git commit`. To run it manually:

```bash
npx prettier --write "src/**/*.{js,jsx,css}"
```

### Adding a New Feature

Follow this layered approach to keep the codebase clean:

1. **State** — Add a new field or action to an existing Zustand slice in `src/store/`, or create a new slice file
2. **Logic** — Create a Custom Hook in `src/hooks/` if the logic is complex or could be reused across components
3. **Native I/O** — Any call to a Neutralino API must go through `src/services/fileService.js`. Never call `window.Neutralino.*` directly inside a component
4. **UI** — Build the component in `src/components/` and wire it into `App.jsx`
5. **Logging** — Use `logger.info / logger.warn / logger.error` from `src/services/logger.js`. Never use `console.log` directly

---

## 🧰 Tech Stack

| Layer              | Technology                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Native Runtime** | [Neutralino.js 5.3](https://neutralino.js.org/)                                                   |
| **UI Framework**   | [React 19](https://react.dev/)                                                                    |
| **Bundler**        | [Vite 8](https://vitejs.dev/)                                                                     |
| **Editor**         | [CodeMirror 6](https://codemirror.net/) via `@uiw/react-codemirror`                               |
| **Markdown**       | [markdown-it](https://github.com/markdown-it/markdown-it)                                         |
| **Math**           | [KaTeX](https://katex.org/) via `markdown-it-katex`                                               |
| **Diagrams**       | [Mermaid](https://mermaid.js.org/)                                                                |
| **State**          | [Zustand](https://zustand-demo.pmnd.rs/)                                                          |
| **Formatting**     | [Prettier](https://prettier.io/)                                                                  |
| **Linting**        | [OXLint](https://oxc.rs/)                                                                         |
| **Git Hooks**      | [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) |
