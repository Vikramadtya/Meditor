import React from "react";

export function GitCommitForm({ commitMessage, setCommitMessage }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "8px",
        }}
      >
        Sync Message
      </label>
      <input
        type="text"
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        placeholder="E.g., Added new meeting notes"
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "var(--bg-primary)",
          border: "1px solid var(--glass-border)",
          borderRadius: "8px",
          color: "var(--text-primary)",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </div>
  );
}
