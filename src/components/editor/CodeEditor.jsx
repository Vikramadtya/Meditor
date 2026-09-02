import { autoSaveFile } from "../../store/actions/index";
import { useShallow } from "zustand/react/shallow";
import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
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
import { useStore } from "../../core/store/index";
import { useSettingsStore } from "../../domains/settings/application/settingsStore";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { Logger } from "../../core/infrastructure/Logger";
const logger = Logger.forContext("App");
import BubbleMenu from "./BubbleMenu";
import { slashCommands } from "../../utils/editor/slashCommands";

/**
 * Renders the CodeMirror-based markdown editor.
 * Includes extensions for drag and drop, vim mode, search, autocompletion, formatting, and a bubble menu.
 *
 * @param {Object} props - The component props.
 * @param {import("@uiw/react-codemirror").ThemeInput} props.theme - The CodeMirror theme to apply.
 * @param {string} [props.height] - The height of the editor (e.g., "100%", "auto").
 * @param {string} [props.minHeight] - The minimum height of the editor.
 * @returns {React.ReactElement} The rendered CodeEditor component.
 */
export default function CodeEditor({ theme, height, minHeight }) {
  const { markdown, setMarkdown } = useStore(
    useShallow((s) => ({
      markdown: s.markdown,
      setMarkdown: s.setMarkdown,
    })),
  );
  const { currentFolder } = useStore(
    useShallow((s) => ({
      currentFolder: s.currentFolder,
    })),
  );
  const { mdConfig } = useSettingsStore();
  const editorViewRef = useRef(null);

  // Bubble Menu State
  const [bubbleMenu, setBubbleMenu] = useState({
    show: false,
    top: 0,
    left: 0,
    from: 0,
    to: 0,
  });
  const dndExtension = useDragAndDrop(
    currentFolder,
    mdConfig.imageSavePath,
    setMarkdown,
  );

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
      EditorView.lineWrapping,
      // ← fills the full column width
      cmMarkdown({
        base: markdownLanguage,
        codeLanguages: languages,
      }),
      dndExtension,
      search({
        top: true,
      }),
      autocompletion({
        override: [slashCommands],
      }),
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
              prev.show
                ? {
                    ...prev,
                    show: false,
                  }
                : prev,
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
      blur: (e) => {
        const { editorConfig } = useSettingsStore.getState();
        if (editorConfig.autoSaveMode === "blur") {
          autoSaveFile();
        }
      },
    });
    exts.push(keymapExt);
    return exts;
  }, [dndExtension, mdConfig.vimMode, formatDocument]);
  return (
    <>
      <CodeMirror
        value={markdown}
        width="100%"
        height={height || "100%"}
        minHeight={minHeight || undefined}
        extensions={extensions}
        onChange={(val) => setMarkdown(val)}
        theme={theme}
        basicSetup={{
          lineNumbers: true,
          // Line Numbers feature request
          foldGutter: false,
          highlightActiveLine: false,
        }}
      />
      <BubbleMenu
        show={bubbleMenu.show}
        top={bubbleMenu.top}
        left={bubbleMenu.left}
        onFormat={handleFormat}
      />
    </>
  );
}
