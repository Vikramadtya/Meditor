import React, { useEffect, useRef } from "react";
import { useUIStore } from "../store/uiStore";
import { useDocumentStore } from "../store/documentStore";
import { useSettingsStore } from "../store/settingsStore";
import { useMarkdown } from "../hooks/useMarkdown";
import { useScrollSync } from "../hooks/useScrollSync";

import CodeEditor from "./CodeEditor";
import MarkdownPreview from "./MarkdownPreview";
import TableOfContents from "./TableOfContents";
import TabsBar from "./TabsBar";
import "../styles/Editor.css";

export default function EditorPane() {
  const { isEditMode, theme, viewLayout } = useUIStore();
  const { markdown } = useDocumentStore();
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

      {isSplit ? (
        /* ── Split mode: two independent scroll columns ── */
        <div className="pane-container split" ref={paneRef}>
          {/* Left: Editor */}
          <div className="split-pane">
            <div className="cm-editor-container" style={{ height: "100%" }}>
              <CodeEditor theme={theme} />
            </div>
          </div>

          <div className="split-divider" />

          {/* Right: Preview */}
          <MarkdownPreview
            ref={proseRef}
            onScroll={handleProseScroll}
            className="split-pane prose fade-pane"
            htmlContent={htmlContent}
            frontmatter={frontmatter}
          />
        </div>
      ) : (
        /* ── Single mode: one centred scrollable column ── */
        <div className="pane-container fade-pane" ref={paneRef}>
          {/* Editor pane */}
          {isEditMode && (
            <div className="cm-editor-container">
              <CodeEditor
                theme={theme}
                height="auto"
                minHeight="calc(100vh - 200px)"
              />
            </div>
          )}

          {/* Preview pane */}
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
  );
}
