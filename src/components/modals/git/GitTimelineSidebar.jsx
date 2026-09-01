import React from "react";
import { Clock } from "lucide-react";
export function GitTimelineSidebar({
  loading,
  history,
  selectedCommit,
  onSelectCommit,
}) {
  return (
    <div
      style={{
        width: "280px",
        flexShrink: 0,
        borderRight: "1px solid var(--glass-border)",
        overflowY: "auto",
        padding: "16px",
        background: "var(--bg-secondary)",
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
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Clock size={12} /> Note History
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
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {history.map((commit) => {
            const isSelected = selectedCommit?.hash === commit.hash;
            return (
              <div
                key={commit.hash}
                onClick={() => onSelectCommit(commit)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: isSelected ? "var(--accent)" : "transparent",
                  color: isSelected ? "#fff" : "var(--text-primary)",
                  border: isSelected
                    ? "1px solid var(--accent)"
                    : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "var(--bg-primary)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: isSelected ? "#fff" : "#8b5cf6",
                    }}
                  >
                    {commit.hash.substring(0, 7)}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      opacity: 0.8,
                    }}
                  >
                    {new Date(commit.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.9,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {commit.subject}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
