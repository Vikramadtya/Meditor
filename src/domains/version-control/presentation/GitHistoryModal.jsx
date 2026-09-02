import { useShallow } from "zustand/react/shallow";
import { useModalEscape } from "../../../core/ui/hooks/useModalEscape";
import React, { useState, useEffect } from "react";
import { X, Clock, RotateCcw, Columns, Eye } from "lucide-react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useStore } from "../../../core/store/index";
import { selectRepoPath } from "../../vault/store/vault.selectors";
import { gitService } from "../application/GitService";
import { fileSystem as fileService } from "../../workspace/infrastructure/NeutralinoFileSystem";
import toast from "react-hot-toast";
import { GitTimelineSidebar } from "./GitTimelineSidebar";
import { GitCommitPreview } from "./GitCommitPreview";

/**
 * Modal component for viewing and restoring file history from Git commits.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @returns {React.ReactElement|null} The Git history modal or null if not open.
 */
export default function GitHistoryModal({ isOpen, onClose }) {
  const { currentFilePath, fileName, markdown, setMarkdown, theme } = useStore(
    useShallow((s) => ({
      currentFilePath: s.currentFilePath,
      fileName: s.fileName,
      markdown: s.markdown,
      theme: s.theme,
      setMarkdown: s.setMarkdown,
    })),
  );
  const [viewMode, setViewMode] = useState("diff"); // "diff" or "preview"

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const repoPath = useStore(selectRepoPath);
  useEffect(() => {
    if (isOpen && currentFilePath && repoPath) {
      loadHistory();
    }
  }, [isOpen, currentFilePath]);
  const loadHistory = async () => {
    setLoading(true);
    try {
      const relPath = currentFilePath.replace(repoPath + "/", "");
      const log = await gitService.getFileHistory(repoPath, relPath);
      setHistory(log);
      setSelectedCommit(null);
      setPreviewContent("");
    } catch (e) {
      setHistory([]);
    }
    setLoading(false);
  };
  const handleSelectCommit = async (commit) => {
    setSelectedCommit(commit);
    try {
      const relPath = currentFilePath.replace(repoPath + "/", "");
      const content = await gitService.getFileAtCommit(
        repoPath,
        commit.hash,
        relPath,
      );
      setPreviewContent(content);
    } catch (e) {
      setPreviewContent("Failed to load content for this revision.");
    }
  };
  const handleRestore = async () => {
    if (confirm("Overwrite your current file with this historical version?")) {
      await fileService.writeFile(currentFilePath, previewContent);
      setMarkdown(previewContent);
      toast.success("Note restored to selected version!");
      onClose();
    }
  };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "1100px",
          maxWidth: "94%",
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "78vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock size={18} /> Note History
            {fileName && (
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                }}
              >
                — {fileName}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Left: Commit list */}
          <GitTimelineSidebar
            loading={loading}
            history={history}
            selectedCommit={selectedCommit}
            onSelectCommit={handleSelectCommit}
          />
          <GitCommitPreview
            theme={theme}
            selectedCommit={selectedCommit}
            viewMode={viewMode}
            setViewMode={setViewMode}
            previewContent={previewContent}
            markdown={markdown}
            onRestore={handleRestore}
          />
        </div>
      </div>
    </div>
  );
}
