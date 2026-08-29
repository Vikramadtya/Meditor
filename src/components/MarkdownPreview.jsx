import React, { forwardRef } from "react";
import FrontmatterBlock from "./FrontmatterBlock";
import { useUIStore } from "../store/uiStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useDocumentStore } from "../store/documentStore";

import { useImageInterceptor } from "../hooks/useImageInterceptor";
import { useMermaidRenderer } from "../hooks/useMermaidRenderer";
import { useMkDocsTabs } from "../hooks/useMkDocsTabs";
import { useInteractiveTaskLists } from "../hooks/useInteractiveTaskLists";

const MarkdownPreview = forwardRef(
  ({ onScroll, className, htmlContent, frontmatter }, ref) => {
    const { theme } = useUIStore();
    const { currentFolder } = useWorkspaceStore();
    const { currentFilePath } = useDocumentStore();

    // Use Custom Hooks
    useImageInterceptor(ref, currentFilePath, currentFolder, htmlContent);
    useMermaidRenderer(ref, htmlContent, theme);
    useMkDocsTabs(ref, htmlContent);
    useInteractiveTaskLists(ref);

    return (
      <div ref={ref} onScroll={onScroll} className={className}>
        <FrontmatterBlock data={frontmatter} />
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  },
);

MarkdownPreview.displayName = "MarkdownPreview";
export default MarkdownPreview;
