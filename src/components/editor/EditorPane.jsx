import { useShallow } from "zustand/react/shallow";
import React, { useEffect, useRef } from "react";
import { useStore } from "../../store/index";
import { useSettingsStore } from "../../store/settingsStore";
import { useMarkdown } from "../../hooks/useMarkdown";
import { useScrollSync } from "../../hooks/useScrollSync";
import CodeEditor from "./CodeEditor";
import MarkdownPreview from "./MarkdownPreview";
import TableOfContents from "./TableOfContents";
import TabsBar from "./TabsBar";
import "../../styles/Editor.css";

/**
 * Main editor pane component that renders either a split view (code and markdown preview)
 * or a single view (code or markdown preview) based on the current layout and mode.
 * Syncs scrolling between the code editor and markdown preview when in split mode.
 *
 * @returns {React.ReactElement} The rendered EditorPane component.
 */
export default function EditorPane() {
  const { isEditMode, theme, viewLayout } = useStore(
    useShallow((s) => ({
      isEditMode: s.isEditMode,
      theme: s.theme,
      viewLayout: s.viewLayout,
    })),
  );
  const { markdown } = useStore(
    useShallow((s) => ({
      markdown: s.markdown,
    })),
  );
  const { mdConfig } = useSettingsStore();
  const { toc, htmlContent, frontmatter } = useMarkdown(markdown, mdConfig);
  const paneRef = useRef(null);
  const proseRef = useRef(null);
  const scrollRef = useRef(0);
  const isSplit = viewLayout === "split";
  const { handleProseScroll } = useScrollSync(isSplit, proseRef);
  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = scrollRef.current;
    }
  }, [isEditMode]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <TabsBar />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {isSplit ? (
          <div
            className="pane-container split"
            ref={paneRef}
            style={{
              flex: 1,
            }}
          >
            <div className="split-pane">
              <div
                className="cm-editor-container"
                style={{
                  height: "100%",
                }}
              >
                <CodeEditor theme={theme} />
              </div>
            </div>
            <div className="split-divider" />
            <MarkdownPreview
              ref={proseRef}
              onScroll={handleProseScroll}
              className="split-pane prose fade-pane"
              htmlContent={htmlContent}
              frontmatter={frontmatter}
            />
          </div>
        ) : (
          <div
            className="pane-container fade-pane"
            ref={paneRef}
            style={{
              flex: 1,
            }}
          >
            {isEditMode && (
              <div className="cm-editor-container">
                <CodeEditor
                  theme={theme}
                  height="auto"
                  minHeight="calc(100vh - 200px)"
                />
              </div>
            )}
            {!isEditMode && (
              <MarkdownPreview
                ref={proseRef}
                className="prose"
                htmlContent={htmlContent}
                frontmatter={frontmatter}
              />
            )}
          </div>
        )}
        <TableOfContents toc={toc} />
      </div>
    </div>
  );
}
