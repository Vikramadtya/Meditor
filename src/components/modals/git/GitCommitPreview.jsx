import React from "react";
import { Columns, Eye, RotateCcw } from "lucide-react";
import ReactDiffViewer from "react-diff-viewer-continued";
export function GitCommitPreview({
  selectedCommit,
  viewMode,
  setViewMode,
  previewContent,
  markdown,
  onRestore,
}) {
  if (!selectedCommit) {
    return (
      <div
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
        }}
      >
        <Clock
          size={48}
          style={{
            opacity: 0.2,
            marginBottom: "16px",
          }}
        />
        <h3>Select a revision</h3>
        <p
          style={{
            fontSize: "14px",
          }}
        >
          Click on a commit in the timeline to view its contents.
        </p>
      </div>
    );
  }
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--bg-primary)",
      }}
    >
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
          <span
            style={{
              fontFamily: "monospace",
              color: "#8b5cf6",
            }}
          >
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
                  viewMode === "diff" ? "var(--bg-primary)" : "transparent",
                boxShadow:
                  viewMode === "diff" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
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
                  viewMode === "preview" ? "var(--bg-primary)" : "transparent",
                boxShadow:
                  viewMode === "preview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
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
            onClick={onRestore}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            <RotateCcw size={14} /> Restore this version
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0",
        }}
      >
        {viewMode === "preview" ? (
          <div
            style={{
              padding: "24px",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              color: "var(--text-primary)",
            }}
          >
            {previewContent}
          </div>
        ) : (
          <ReactDiffViewer
            oldValue={previewContent}
            newValue={markdown}
            splitView={true}
            hideLineNumbers={false}
            useDarkTheme={true}
            leftTitle="Historical Version"
            rightTitle="Current Version"
            styles={{
              variables: {
                dark: {
                  diffViewerBackground: "transparent",
                  diffViewerTitleBackground: "var(--bg-secondary)",
                  addedBackground: "rgba(34, 197, 94, 0.15)",
                  addedColor: "#4ade80",
                  removedBackground: "rgba(239, 68, 68, 0.15)",
                  removedColor: "#f87171",
                  wordAddedBackground: "rgba(34, 197, 94, 0.3)",
                  wordRemovedBackground: "rgba(239, 68, 68, 0.3)",
                },
              },
              line: {
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
