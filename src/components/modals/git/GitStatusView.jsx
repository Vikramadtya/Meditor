import React from "react";
import { FolderGit2, History, Cloud, Save, RefreshCw } from "lucide-react";
import { chipStyle } from "../../Settings/SettingsStyles";

export function GitStatusView({
  loading,
  isRepo,
  handleInit,
  handleCommitAll,
  handleReviewSync,
}) {
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "var(--text-secondary)",
        }}
      >
        Checking status...
      </div>
    );
  }

  if (!isRepo) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            border: "1px solid var(--glass-border)",
          }}
        >
          <FolderGit2 size={36} color="var(--text-secondary)" />
        </div>
        <h3
          style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: 600 }}
        >
          Not Tracked
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "32px",
            fontSize: "14px",
            lineHeight: 1.5,
            maxWidth: "340px",
            margin: "0 auto 32px",
          }}
        >
          This vault is not currently initialized as a Git repository. Enable
          version control to keep track of every edit over time.
        </p>
        <button
          onClick={handleInit}
          style={{
            ...chipStyle,
            background: "var(--accent)",
            color: "#fff",
            padding: "10px 24px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Initialize Repository
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          background: "var(--bg-secondary)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <History size={18} color="var(--accent)" />
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
            Local Snapshot
          </h3>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "20px",
            lineHeight: 1.5,
          }}
        >
          Save all your current modifications to the local Git history. You can
          view history later from the command palette.
        </p>
        <button
          onClick={handleCommitAll}
          style={{
            ...chipStyle,
            background: "var(--bg-primary)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-primary)",
            fontWeight: 500,
            padding: "8px 16px",
          }}
        >
          <Save size={14} /> Commit All Changes
        </button>
      </div>

      <div
        style={{
          background: "var(--bg-secondary)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <Cloud size={18} color="#8b5cf6" />
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
            Remote Sync
          </h3>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "20px",
            lineHeight: 1.5,
          }}
        >
          Push your local commits and pull any new changes from the remote
          server. Ensure you have configured a remote origin.
        </p>
        <button
          onClick={handleReviewSync}
          style={{
            ...chipStyle,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 500,
            padding: "8px 16px",
          }}
        >
          <RefreshCw size={14} /> Sync Vault
        </button>
      </div>
    </div>
  );
}
