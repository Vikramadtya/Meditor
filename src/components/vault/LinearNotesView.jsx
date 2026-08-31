import React, { useState, useEffect, useRef } from "react";
import { useMarkdown } from "../../hooks/useMarkdown";
import MarkdownPreview from "../editor/MarkdownPreview";
import { useSettingsStore } from "../../store/settingsStore";
import { fileSystem } from "../../infrastructure/NeutralinoFileSystem";
import { vaultService } from "../../application/vault/VaultService";
import { Loader2 } from "lucide-react";

/**
 * LinearNotesView Component
 *
 * Compiles and renders all notes within a collection as a single continuous document.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.collection - The collection object whose notes will be compiled.
 * @returns {JSX.Element} The rendered LinearNotesView component.
 */
export default function LinearNotesView({ collection }) {
  const [linearContent, setLinearContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { mdConfig } = useSettingsStore();
  const previewRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLinearContent = async () => {
      setIsLoading(true);
      try {
        let compiledMarkdown = `# ${collection.name}\n\n`;
        const modules = collection.children || [];

        for (const module of modules) {
          compiledMarkdown += `## ${module.name}\n\n`;
          for (const note of module.children || []) {
            compiledMarkdown += `### ${note.name}\n\n`;
            try {
              const filePath = await vaultService.getNotePath(note.id);
              const content = await fileSystem.readFile(filePath);
              const stripped = content.replace(/^---\n[\s\S]*?\n---\n/, "");
              compiledMarkdown += stripped + "\n\n---\n\n";
            } catch (err) {
              compiledMarkdown += `_Failed to load note: ${note.name}_\n\n`;
            }
          }
        }
        if (isMounted) {
          setLinearContent(compiledMarkdown);
          setIsLoading(false);
        }
      } catch (e) {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLinearContent();
    return () => {
      isMounted = false;
    };
  }, [collection]);

  const { htmlContent } = useMarkdown(linearContent, mdConfig);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Let MarkdownPreview handle internal scrolling or it can grow
      }}
    >
      {isLoading ? (
        <div
          style={{
            padding: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={20} className="animate-spin" /> Compiling Linear
          View...
        </div>
      ) : (
        <MarkdownPreview
          ref={previewRef}
          className="prose fade-pane"
          htmlContent={htmlContent}
          frontmatter={null}
        />
      )}
    </div>
  );
}
