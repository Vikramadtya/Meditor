import React from "react";
import { FileText } from "lucide-react";
export function GitDiffViewer({ uncommittedChanges }) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "8px",
        maxHeight: "300px",
        overflowY: "auto",
        marginBottom: "24px",
      }}
    >
      {uncommittedChanges.length === 0 ? (
        <div
          style={{
            padding: "16px",
            color: "var(--text-secondary)",
            fontSize: "13px",
          }}
        >
          No uncommitted changes to sync.
        </div>
      ) : (
        uncommittedChanges.map((change, idx) => (
          <div
            key={idx}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom:
                idx < uncommittedChanges.length - 1
                  ? "1px solid var(--glass-border)"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FileText size={16} color="var(--text-secondary)" />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {change.file}
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "12px",
                backgroundColor:
                  change.status === "Added"
                    ? "rgba(34, 197, 94, 0.15)"
                    : change.status === "Deleted"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(234, 179, 8, 0.15)",
                color:
                  change.status === "Added"
                    ? "#22c55e"
                    : change.status === "Deleted"
                      ? "#ef4444"
                      : "#eab308",
              }}
            >
              {change.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
