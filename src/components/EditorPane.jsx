import React, { useEffect, useRef, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { search } from "@codemirror/search";
import { autocompletion } from "@codemirror/autocomplete";
import {
  markdown as cmMarkdown,
  markdownLanguage,
} from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { linter, lintGutter } from "@codemirror/lint";
import prettier from "prettier/standalone";
import prettierMarkdown from "prettier/plugins/markdown";
import toast from "react-hot-toast";
import mermaid from "mermaid";

import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";
import { useSettingsStore } from "../store/settingsStore";
import { useMarkdown } from "../hooks/useMarkdown";
import { fileService } from "../services/fileService";
import { logger } from "../services/logger";

import TableOfContents from "./TableOfContents";
import FrontmatterBlock from "./FrontmatterBlock";
import "../styles/Editor.css";

const slashCommands = (context) => {
  let word = context.matchBefore(/\/.*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: "/h1", type: "text", apply: "# ", info: "Heading 1" },
      { label: "/h2", type: "text", apply: "## ", info: "Heading 2" },
      {
        label: "/table",
        type: "text",
        apply: "| Header | Header |\n|--------|--------|\n| Cell   | Cell   |",
        info: "Table",
      },
      { label: "/code", type: "text", apply: "```\n\n```", info: "Code Block" },
      {
        label: "/mermaid",
        type: "text",
        apply: "```mermaid\ngraph TD;\n    A-->B;\n```",
        info: "Mermaid Flowchart",
      },
      { label: "/quote", type: "text", apply: "> ", info: "Blockquote" },
    ],
  };
};

export default function EditorPane() {
  const { isEditMode, theme, viewLayout } = useUIStore();
  const { markdown, setMarkdown, currentFolder } = useFileStore();
  const { mdConfig } = useSettingsStore();

  const { htmlContent, toc, frontmatter } = useMarkdown(markdown, mdConfig);

  const paneRef = useRef(null);
  const proseRef = useRef(null);
  const scrollRef = useRef(0);

  const handleScroll = (e) => {
    scrollRef.current = e.target.scrollTop;
  };

  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = scrollRef.current;
    }
  }, [isEditMode]);

  // Intercept HTML updates to load local images via Neutralino Native Filesystem
  useEffect(() => {
    if (!proseRef.current || !currentFolder) return;
    const images = proseRef.current.querySelectorAll("img");
    images.forEach(async (img) => {
      const src = img.getAttribute("src");
      if (src && (src.startsWith("./") || src.startsWith("/"))) {
        try {
          const relativePath = src.replace(/^\.\//, "");
          const absolutePath = `${currentFolder}/${relativePath}`;
          const buffer = await fileService.readBinaryFile(absolutePath);
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          img.src = `data:image/png;base64,${base64}`;
        } catch (e) {
          logger.warn(`Could not load local image: ${src}`, e);
        }
      }
    });
  }, [htmlContent, currentFolder]);

  // Mermaid Diagram Post-Processing
  useEffect(() => {
    if (!proseRef.current) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

    // Find all markdown code blocks tagged with "mermaid"
    const mermaidNodes = proseRef.current.querySelectorAll(
      "code.language-mermaid",
    );
    if (mermaidNodes.length > 0) {
      mermaidNodes.forEach((node) => {
        const parent = node.parentElement; // The <pre> tag
        if (parent && parent.tagName === "PRE") {
          const div = document.createElement("div");
          div.className = "mermaid";
          div.textContent = node.textContent;
          parent.replaceWith(div);
        }
      });
      // Render all .mermaid divs
      mermaid.run({ querySelector: ".mermaid" }).catch((err) => {
        logger.warn("Mermaid rendering error", err);
      });
    }
  }, [htmlContent, theme]);

  // CodeMirror Drag and Drop Extension
  const dndExtension = useMemo(() => {
    return EditorView.domEventHandlers({
      drop(event, view) {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0 && files[0].type.startsWith("image/")) {
          event.preventDefault();
          const file = files[0];

          // Get the exact document position where the image was dropped
          const posObj = view.posAtCoords({
            x: event.clientX,
            y: event.clientY,
          });
          if (!posObj) return false;
          const pos = typeof posObj === "object" ? posObj.pos : posObj;

          if (!currentFolder) {
            toast.error("Please open a workspace folder first!");
            return true;
          }

          (async () => {
            try {
              // Create the directory if it doesn't exist
              const saveDirName = mdConfig.imageSavePath || "./images";
              const cleanSaveDirName = saveDirName.replace(/^\.\//, "");
              const destFolder = `${currentFolder}/${cleanSaveDirName}`;

              await fileService.createDirectory(destFolder);

              const destPath = `${destFolder}/${file.name}`;

              // Use FileReader to extract the ArrayBuffer and write it natively
              const reader = new FileReader();
              reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                await fileService.writeBinaryFile(destPath, arrayBuffer);

                // Insert the markdown image text
                const insertText = `![${file.name}](${saveDirName}/${file.name})`;
                view.dispatch({
                  changes: { from: pos, to: pos, insert: insertText },
                });

                // Update Zustand store so the changes persist
                setMarkdown(view.state.doc.toString());
                toast.success("Image saved and inserted!");
                logger.info(
                  `Successfully processed dropped image: ${file.name}`,
                );
              };
              reader.onerror = () => {
                toast.error("Failed to read dropped file");
              };
              reader.readAsArrayBuffer(file);
            } catch (err) {
              toast.error("Failed to save image");
              logger.error("Drop error", err);
            }
          })();
          return true; // Stop browser from opening the image full screen
        }
        return false;
      },
    });
  }, [currentFolder, mdConfig.imageSavePath, setMarkdown]);

  // Prettier Formatting Command
  const formatDocument = () => {
    try {
      const formatted = prettier.format(markdown, {
        parser: "markdown",
        plugins: [prettierMarkdown],
        proseWrap: "always",
      });
      setMarkdown(formatted);
      toast.success("Document Formatted!");
    } catch (e) {
      toast.error("Formatting failed");
      logger.error("Prettier error", e);
    }
  };

  // Setup extensions
  const extensions = useMemo(() => {
    const exts = [
      cmMarkdown({ base: markdownLanguage, codeLanguages: languages }),
      dndExtension,
      search({ top: true }),
      autocompletion({ override: [slashCommands] }),
      lintGutter(),
    ];
    if (mdConfig.vimMode) {
      exts.push(vim());
    }

    // Setup Keybindings for Formatting (Cmd+Shift+F)
    const keymapExt = EditorView.domEventHandlers({
      keydown: (e, view) => {
        if (e.metaKey && e.shiftKey && e.key.toLowerCase() === "f") {
          e.preventDefault();
          formatDocument();
          return true;
        }
      },
    });
    exts.push(keymapExt);

    return exts;
  }, [dndExtension, mdConfig.vimMode, markdown]);

  const isSplit = viewLayout === "split";

  // Scroll Sync Logic
  const syncTimeoutRef = useRef(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  const handleEditorScroll = (e) => {
    if (!isSplit || isSyncingRight.current) return;
    isSyncingLeft.current = true;

    const scroller = e.target;
    if (!scroller.classList.contains("cm-scroller")) return;

    const percentage =
      scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight);
    if (proseRef.current) {
      proseRef.current.scrollTop =
        percentage *
        (proseRef.current.scrollHeight - proseRef.current.clientHeight);
    }

    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isSyncingLeft.current = false;
    }, 50);
  };

  const handleProseScroll = (e) => {
    if (!isSplit || isSyncingLeft.current) return;
    isSyncingRight.current = true;

    const percentage =
      e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    const cmScroller = document.querySelector(".cm-scroller");
    if (cmScroller) {
      cmScroller.scrollTop = Math.round(
        percentage * (cmScroller.scrollHeight - cmScroller.clientHeight),
      );
    }

    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isSyncingRight.current = false;
    }, 50);
  };

  useEffect(() => {
    const cmScroller = document.querySelector(".cm-scroller");
    if (cmScroller) {
      cmScroller.addEventListener("scroll", handleEditorScroll);
      return () => cmScroller.removeEventListener("scroll", handleEditorScroll);
    }
  }, [isSplit]);

  return (
    <>
      <div className={`pane-container ${isSplit ? "split" : ""}`} ref={paneRef}>
        <div
          className={`fade-pane ${isSplit || isEditMode ? "visible" : "hidden"}`}
          style={{
            display: isSplit || isEditMode ? "block" : "none",
            height: "100%",
            flex: 1,
            overflowY: isSplit ? "hidden" : "visible",
          }}
        >
          <div className="cm-editor-container" style={{ height: "100%" }}>
            <CodeMirror
              value={markdown}
              height="100%"
              extensions={extensions}
              onChange={(val) => setMarkdown(val)}
              theme={theme}
              style={{ fontSize: "15px", fontFamily: "var(--font-mono)" }}
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
              }}
            />
          </div>
        </div>

        {isSplit && <div className="split-divider" />}

        <div
          ref={proseRef}
          onScroll={handleProseScroll}
          className={`fade-pane prose ${isSplit || !isEditMode ? "visible" : "hidden"}`}
          style={{
            display: isSplit || !isEditMode ? "block" : "none",
            flex: 1,
            overflowY: isSplit ? "auto" : "visible",
            paddingLeft: isSplit ? "24px" : "0",
          }}
        >
          <FrontmatterBlock data={frontmatter} />
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>

      <TableOfContents toc={toc} />
    </>
  );
}
