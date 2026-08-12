import React, {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";
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
import { useMkDocsTabs } from "../hooks/useMkDocsTabs";

import TableOfContents from "./TableOfContents";
import FrontmatterBlock from "./FrontmatterBlock";
import BubbleMenu from "./BubbleMenu";
import { slashCommands } from "../utils/editor/slashCommands";
import "../styles/Editor.css";

export default function EditorPane() {
  const { isEditMode, theme, viewLayout } = useUIStore();
  const { markdown, setMarkdown, currentFolder } = useFileStore();
  const { mdConfig } = useSettingsStore();

  const { htmlContent, toc, frontmatter } = useMarkdown(markdown, mdConfig);

  const paneRef = useRef(null);
  const proseRef = useRef(null);
  const editorViewRef = useRef(null);
  const scrollRef = useRef(0);
  const isSplit = viewLayout === "split";

  // Bubble Menu State
  const [bubbleMenu, setBubbleMenu] = useState({
    show: false,
    top: 0,
    left: 0,
    from: 0,
    to: 0,
  });

  // Use Custom Hooks
  const { handleProseScroll } = useScrollSync(isSplit, proseRef);
  useImageInterceptor(proseRef, currentFolder, htmlContent);
  useMermaidRenderer(proseRef, htmlContent, theme);
  useMkDocsTabs(proseRef, htmlContent);
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

  const handleFormat = useCallback((prefix, suffix) => {
    if (!editorViewRef.current) return;
    const view = editorViewRef.current;
    const selection = view.state.selection.main;
    const text = view.state.sliceDoc(selection.from, selection.to);

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: `${prefix}${text}${suffix}`,
      },
      selection: {
        anchor: selection.from + prefix.length,
        head: selection.from + prefix.length + text.length,
      },
    });
    view.focus();
  }, []);

  // Setup CodeMirror extensions
  const extensions = useMemo(() => {
    const exts = [
      EditorView.lineWrapping, // ← fills the full column width
      cmMarkdown({ base: markdownLanguage, codeLanguages: languages }),
      dndExtension,
      search({ top: true }),
      autocompletion({ override: [slashCommands] }),
      lintGutter(),
    ];
    if (mdConfig.vimMode) {
      exts.push(vim());
    }

    // Bubble Menu Selection Listener
    exts.push(
      EditorView.updateListener.of((update) => {
        if (update.selectionSet || update.docChanged) {
          const selection = update.state.selection.main;
          if (!selection.empty && selection.to - selection.from > 0) {
            // Get screen coordinates of the selection
            const view = update.view;
            editorViewRef.current = view;

            // We use setTimeout to let the DOM settle so coordsAtPos gives correct values
            setTimeout(() => {
              const startCoords = view.coordsAtPos(selection.from);
              const endCoords = view.coordsAtPos(selection.to);
              if (startCoords && endCoords) {
                // Center above the selection
                const left =
                  startCoords.left + (endCoords.right - startCoords.left) / 2;
                setBubbleMenu({
                  show: true,
                  top: startCoords.top,
                  left: left,
                  from: selection.from,
                  to: selection.to,
                });
              }
            }, 0);
          } else {
            setBubbleMenu((prev) =>
              prev.show ? { ...prev, show: false } : prev,
            );
          }
        }
      }),
    );

    // Cmd+Shift+F → Prettier format
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
      {isSplit ? (
        /* ── Split mode: two independent scroll columns ── */
        <div className="pane-container split" ref={paneRef}>
          {/* Left: Editor */}
          <div className="split-pane">
            <div className="cm-editor-container" style={{ height: "100%" }}>
              <CodeMirror
                value={markdown}
                width="100%"
                height="100%"
                extensions={extensions}
                onChange={(val) => setMarkdown(val)}
                theme={theme}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  highlightActiveLine: false,
                }}
              />
            </div>
          </div>

          <div className="split-divider" />

          {/* Right: Preview */}
          <div
            ref={proseRef}
            onScroll={handleProseScroll}
            className="split-pane prose fade-pane"
          >
            <FrontmatterBlock data={frontmatter} />
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>
      ) : (
        /* ── Single mode: one centred scrollable column ── */
        <div className="pane-container fade-pane" ref={paneRef}>
          {/* Editor pane */}
          {isEditMode && (
            <div className="cm-editor-container">
              <CodeMirror
                value={markdown}
                width="100%"
                height="auto"
                minHeight="calc(100vh - 200px)"
                extensions={extensions}
                onChange={(val) => setMarkdown(val)}
                theme={theme}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  highlightActiveLine: false,
                }}
              />
            </div>
          )}

          {/* Preview pane */}
          {!isEditMode && (
            <div ref={proseRef} className="prose">
              <FrontmatterBlock data={frontmatter} />
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          )}
        </div>
      )}

      <TableOfContents toc={toc} />

      <BubbleMenu
        show={bubbleMenu.show}
        top={bubbleMenu.top}
        left={bubbleMenu.left}
        onFormat={handleFormat}
      />
    </>
  );
}
