import { useModalEscape } from "../../hooks/useModalEscape";
import React, { useState, useEffect } from "react";
import { X, Clock, RotateCcw, Columns, Eye } from "lucide-react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useStore } from "../../store/index";

import { gitService } from "../../application/git/GitService";
import { fileSystem as fileService } from "../../infrastructure/NeutralinoFileSystem";
import toast from "react-hot-toast";

/**
 * Modal component for viewing and restoring file history from Git commits.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @returns {React.ReactElement|null} The Git history modal or null if not open.
 */
export default function GitHistoryModal({ isOpen, onClose }) {
  const {
    currentFilePath,
    fileName,
    markdown,
    setMarkdown,
    workspaceRoot,
    currentFolder,
  } = useStore();
  const [viewMode, setViewMode] = useState("diff"); // "diff" or "preview"

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [previewContent, setPreviewContent] = useState("");

  const repoPath = workspaceRoot || currentFolder;

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

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left: Commit list */}
          <div
            style={{
              width: "260px",
              flexShrink: 0,
              borderRight: "1px solid var(--glass-border)",
              overflowY: "auto",
              padding: "16px 12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: "12px",
                paddingLeft: "4px",
              }}
            >
              Note History
            </div>
            {loading ? (
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  padding: "8px 4px",
                }}
              >
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  padding: "8px 4px",
                  fontStyle: "italic",
                }}
              >
                No commits found. Initialize Git and commit your vault first.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {history.map((commit) => {
                  const isSelected = selectedCommit?.hash === commit.hash;
                  return (
                    <div
                      key={commit.hash}
                      onClick={() => handleSelectCommit(commit)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: isSelected
                          ? "var(--bg-secondary)"
                          : "transparent",
                        borderLeft: isSelected
                          ? "2px solid var(--accent)"
                          : "2px solid transparent",
                        transition: "all 0.1s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "var(--bg-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontFamily: "monospace",
                          color: "#8b5cf6",
                          fontWeight: 600,
                          marginBottom: "3px",
                        }}
                      >
                        {commit.hash?.slice(0, 7)}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          marginBottom: "3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {commit.subject || "Commit"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {commit.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {selectedCommit ? (
              <>
                {/* Header bar */}
                <div
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--glass-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Viewing Revision{" "}
                    <span style={{ fontFamily: "monospace", color: "#8b5cf6" }}>
                      {selectedCommit.hash?.slice(0, 7)}
                    </span>
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        background: "var(--bg-secondary)",
                        borderRadius: "8px",
                        padding: "2px",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      <button
                        onClick={() => setViewMode("diff")}
                        style={{
                          padding: "6px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "6px",
                          border: "none",
                          background:
                            viewMode === "diff" ? "#fff" : "transparent",
                          boxShadow:
                            viewMode === "diff"
                              ? "0 1px 3px rgba(0,0,0,0.1)"
                              : "none",
                          color:
                            viewMode === "diff"
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <Columns size={14} /> Diff
                      </button>
                      <button
                        onClick={() => setViewMode("preview")}
                        style={{
                          padding: "6px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "6px",
                          border: "none",
                          background:
                            viewMode === "preview" ? "#fff" : "transparent",
                          boxShadow:
                            viewMode === "preview"
                              ? "0 1px 3px rgba(0,0,0,0.1)"
                              : "none",
                          color:
                            viewMode === "preview"
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    </div>

                    <button
                      onClick={handleRestore}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        background: "#a855f7",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Restore This Version
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div
                  style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
                >
                  {viewMode === "diff" ? (
                    <div style={{ padding: "0" }}>
                      <ReactDiffViewer
                        oldValue={previewContent}
                        newValue={markdown}
                        splitView={true}
                        hideLineNumbers={false}
                        leftTitle="Historical Version"
                        rightTitle="Current Version"
                        styles={{
                          variables: {
                            light: {
                              diffViewerBackground: "#fff",
                              diffViewerColor: "#333",
                              addedBackground: "#e6ffed",
                              addedColor: "#24292e",
                              removedBackground: "#ffeef0",
                              removedColor: "#24292e",
                              wordAddedBackground: "#acf2bd",
                              wordRemovedBackground: "#fdb8c0",
                              addedGutterBackground: "#cdffd8",
                              removedGutterBackground: "#ffdce0",
                              gutterBackground: "#f7f7f7",
                              gutterBackgroundDark: "#f3f1f1",
                              highlightBackground: "#fffbdd",
                              highlightGutterBackground: "#fff5b1",
                              emptyLineBackground: "#fafbfc",
                            },
                          },
                          line: {
                            fontSize: "12px",
                            fontFamily:
                              "SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace",
                          },
                          titleBlock: {
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "8px 16px",
                            background: "#fafbfc",
                            borderBottom: "1px solid #e1e4e8",
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={previewContent}
                      readOnly
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: "16px 20px",
                        background: "transparent",
                        color: "var(--text-primary)",
                        border: "none",
                        resize: "none",
                        fontFamily:
                          "SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                <Clock size={40} style={{ opacity: 0.2 }} />
                <div style={{ fontSize: "14px" }}>
                  Select a revision from the sidebar to view its content.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
