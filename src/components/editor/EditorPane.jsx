import React, { useEffect, useRef } from "react";
import { useStore } from "../../store/index";
import { useSettingsStore } from "../../store/settingsStore";
import { selectShowDashboard } from "../../store/selectors/index";
import { useMarkdown } from "../../hooks/useMarkdown";
import { useScrollSync } from "../../hooks/useScrollSync";

import CodeEditor from "./CodeEditor";
import MarkdownPreview from "./MarkdownPreview";
import TableOfContents from "./TableOfContents";
import TabsBar from "./TabsBar";
import VaultDashboard from "../vault/VaultDashboard";
import CollectionDashboard from "../vault/CollectionDashboard";
import FavoritesDashboard from "../vault/FavoritesDashboard";
import TodayPage from "../vault/TodayPage";
import AgendaPage from "../vault/AgendaPage";
import FlashcardReviewPage from "../vault/FlashcardReviewPage";
import KnowledgeGraphPage from "../vault/KnowledgeGraphPage";
import AnalyticsPage from "../vault/AnalyticsPage";
import TagsPage from "../vault/TagsPage";

import "../../styles/Editor.css";

export default function EditorPane() {
  const { isEditMode, theme, viewLayout, activeVaultItem } = useStore();
  const showDashboard = useStore(selectShowDashboard);
  const { markdown } = useStore();
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
      {!showDashboard && <TabsBar />}

      {showDashboard ? (
        <div className="pane-container" style={{ overflow: "hidden" }}>
          {activeVaultItem?.type === "collection" && <CollectionDashboard />}
          {activeVaultItem?.type === "favorites" && <FavoritesDashboard />}
          {activeVaultItem?.type === "today" && <TodayPage />}
          {activeVaultItem?.type === "agenda" && <AgendaPage />}
          {activeVaultItem?.type === "flashcards" && <FlashcardReviewPage />}
          {activeVaultItem?.type === "graph" && <KnowledgeGraphPage />}
          {activeVaultItem?.type === "analytics" && <AnalyticsPage />}
          {activeVaultItem?.type === "tags" && <TagsPage />}
          {(!activeVaultItem ||
            ![
              "collection",
              "favorites",
              "today",
              "agenda",
              "flashcards",
              "graph",
              "analytics",
              "tags",
            ].includes(activeVaultItem.type)) && <VaultDashboard />}
        </div>
      ) : (
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
              style={{ flex: 1 }}
            >
              <div className="split-pane">
                <div className="cm-editor-container" style={{ height: "100%" }}>
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
              style={{ flex: 1 }}
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
      )}
    </div>
  );
}
