import React, { useEffect, useRef, useMemo, useCallback } from "react";
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
import { lintGutter } from "@codemirror/lint";
import prettier from "prettier/standalone";
import prettierMarkdown from "prettier/plugins/markdown";
import toast from "react-hot-toast";

import { useUIStore } from "../store/uiStore";
import { useFileStore } from "../store/fileStore";
import { useSettingsStore } from "../store/settingsStore";
import { useMarkdown } from "../hooks/useMarkdown";
import { logger } from "../services/logger";

// Custom Hooks
import { useScrollSync } from "../hooks/useScrollSync";
import { useImageInterceptor } from "../hooks/useImageInterceptor";
import { useMermaidRenderer } from "../hooks/useMermaidRenderer";
import { useDragAndDrop } from "../hooks/useDragAndDrop";

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
  const isSplit = viewLayout === "split";

  // Use Custom Hooks
  const { handleProseScroll } = useScrollSync(isSplit, proseRef);
  useImageInterceptor(proseRef, currentFolder, htmlContent);
  useMermaidRenderer(proseRef, htmlContent, theme);
  const dndExtension = useDragAndDrop(
    currentFolder,
    mdConfig.imageSavePath,
    setMarkdown,
  );

  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = scrollRef.current;
    }
  }, [isEditMode]);

  // Prettier Formatting Command
  const formatDocument = useCallback(() => {
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
  }, [markdown, setMarkdown]);

  // Setup CodeMirror extensions
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
      keydown: (e) => {
        if (e.metaKey && e.shiftKey && e.key.toLowerCase() === "f") {
          e.preventDefault();
          formatDocument();
          return true;
        }
      },
    });
    exts.push(keymapExt);

    return exts;
  }, [dndExtension, mdConfig.vimMode, formatDocument]);

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
