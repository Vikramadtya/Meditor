import { openNoteByName } from "../../../../core/store/actions";
import { useShallow } from "zustand/react/shallow";
import React, { forwardRef, useEffect, useState } from "react";
import FrontmatterBlock from "./FrontmatterBlock";
import { useStore } from "../../../../core/store/index";
import { searchService } from "../../application/SearchService";
import { Link } from "lucide-react";
import { useImageInterceptor } from "../hooks/useImageInterceptor";
import { useMermaidRenderer } from "../hooks/useMermaidRenderer";
import { useMkDocsTabs } from "../hooks/useMkDocsTabs";
import { useInteractiveTaskLists } from "../hooks/useInteractiveTaskLists";
import { useWikilinks } from "../hooks/useWikilinks";

/**
 * Markdown preview component that renders HTML content with various custom extensions
 * like images, mermaid diagrams, interactive task lists, and wikilinks. Also displays backlinks.
 *
 * @param {Object} props - The component props.
 * @param {function} props.onScroll - Callback for scroll events, used for scroll syncing.
 * @param {string} props.className - CSS class name for styling.
 * @param {string} props.htmlContent - The HTML string to render.
 * @param {Object} props.frontmatter - The parsed frontmatter data.
 * @param {React.Ref<HTMLDivElement>} ref - Ref forwarded to the container div.
 * @returns {React.ReactElement} The rendered MarkdownPreview component.
 */
const MarkdownPreview = forwardRef(
  ({ onScroll, className, htmlContent, frontmatter }, ref) => {
    const { theme, currentFolder, currentFilePath, fileName } = useStore(
      useShallow((s) => ({
        theme: s.theme,
        currentFolder: s.currentFolder,
        currentFilePath: s.currentFilePath,
        fileName: s.fileName,
      })),
    );
    const [backlinks, setBacklinks] = useState([]);

    // Fetch backlinks when file changes
    useEffect(() => {
      let isMounted = true;
      const fetchBacklinks = async () => {
        if (!fileName) {
          setBacklinks([]);
          return;
        }

        // Strip .md
        const logicalName = fileName.replace(".md", "");
        let links = [];
        try {
          links = await (async () => {
            const state = useStore.getState();
            return searchService.getBacklinks(
              logicalName,
              state.workspaceMode,
              state.workspaceRoot || state.currentFolder,
            );
          })();
        } catch (err) {
          log.error("Failed to fetch backlinks", err);
        }
        if (isMounted) {
          setBacklinks(links);
        }
      };
      fetchBacklinks();
      return () => {
        isMounted = false;
      };
    }, [fileName, htmlContent]); // Re-fetch on htmlContent change to catch new links saved

    // Use Custom Hooks
    useImageInterceptor(ref, currentFilePath, currentFolder, htmlContent);
    useMermaidRenderer(ref, htmlContent, theme);
    useMkDocsTabs(ref, htmlContent);
    useInteractiveTaskLists(ref);
    useWikilinks(ref);
    return (
      <div
        ref={ref}
        onScroll={onScroll}
        className={className}
        style={{
          position: "relative",
        }}
      >
        <FrontmatterBlock data={frontmatter} />

        {/* Isolate dangerouslySetInnerHTML to prevent React from resetting mutated DOM (e.g. mermaid) when styles change */}
        <div
          style={{
            paddingBottom: backlinks.length > 0 ? "40px" : "10px",
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: htmlContent,
            }}
          />
        </div>

        {backlinks.length > 0 && (
          <div
            style={{
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid var(--glass-border)",
              paddingBottom: "40px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                margin: "0 0 16px 0",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Link size={16} /> Backlinks
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {backlinks.map((bl, i) => (
                <div
                  key={bl.name || i}
                  className="wikilink-card"
                  onClick={() => openNoteByName(bl.name)}
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-border)",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "var(--accent)",
                  }}
                >
                  {bl.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
MarkdownPreview.displayName = "MarkdownPreview";
export default MarkdownPreview;
