import { useModalEscape } from "../../hooks/useModalEscape";
import React, { useState, useEffect } from "react";
import {
  X,
  GitBranch,
  RefreshCw,
  Save,
  FolderGit2,
  History,
  Cloud,
  FileText,
} from "lucide-react";
import { useStore } from "../../store/index";
import { gitService } from "../../application/git/GitService";
import {
  iconBtnStyle,
  chipStyle,
  inputStyle,
} from "../Settings/SettingsStyles";
import toast from "react-hot-toast";
import { GitDiffViewer } from "./git/GitDiffViewer";
import { GitCommitForm } from "./git/GitCommitForm";

/**
 * Modal component for managing Git operations within the vault.
 * Provides UI for initializing a repository, committing changes, and syncing with a remote.
 *
 * @returns {React.ReactElement|null} The Git management modal or null if not open.
 */
export default function GitModal() {
  const { isGitModalOpen, setGitModalOpen, workspaceRoot, currentFolder } =
    useStore();
  useModalEscape(isGitModalOpen, () => setGitModalOpen(false));
  const [isRepo, setIsRepo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("main");
  const [uncommittedChanges, setUncommittedChanges] = useState([]);
  const [commitMessage, setCommitMessage] = useState("Auto sync commit");

  useEffect(() => {
    if (isGitModalOpen) {
      setView("main");
      setCommitMessage("Auto sync commit");
      checkRepo();
    }
  }, [isGitModalOpen]);

  const checkRepo = async () => {
    setLoading(true);
    const repoPath = workspaceRoot || currentFolder;
    if (!repoPath) {
      setIsRepo(false);
      setLoading(false);
      return;
    }
    const repoExists = await gitService.isRepo(repoPath);
    setIsRepo(repoExists);
    setLoading(false);
  };

  const handleInit = async () => {
    try {
      const repoPath = workspaceRoot || currentFolder;
      await gitService.initRepo(repoPath);
      toast.success("Git repository initialized!");
      checkRepo();
    } catch (e) {
      toast.error("Failed to initialize git");
    }
  };

  const handleCommitAll = async () => {
    try {
      const repoPath = workspaceRoot || currentFolder;
      await gitService.commitAll(repoPath, "Manual commit from Meditor");
      toast.success("Saved to Git History!");
    } catch (e) {
      toast.error("Nothing to commit, or error occurred");
    }
  };

  const handleReviewSync = async () => {
    const repoPath = workspaceRoot || currentFolder;
    toast.loading("Gathering changes...", { id: "sync-prep" });
    try {
      const changes = await gitService.getStatus(repoPath);
      setUncommittedChanges(changes);
      setView("review");
      toast.dismiss("sync-prep");
    } catch (e) {
      toast.error("Failed to gather status", { id: "sync-prep" });
    }
  };

  const handleConfirmSync = async () => {
    try {
      const repoPath = workspaceRoot || currentFolder;
      toast.loading("Committing & Syncing...", { id: "sync" });
      if (uncommittedChanges.length > 0) {
        await gitService.commitAll(repoPath, commitMessage);
      }
      await gitService.sync(repoPath);
      toast.success("Synced successfully!", { id: "sync" });
      setView("main");
      setGitModalOpen(false);
    } catch (e) {
      toast.error("Sync failed. Check remote configuration.", { id: "sync" });
    }
  };

  if (!isGitModalOpen) return null;

  return (
    <div className="modal-overlay open" onClick={() => setGitModalOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "500px",
          maxWidth: "90%",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)",
            padding: "24px 32px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 8px 0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "1.25rem",
                color: "var(--text-primary)",
              }}
            >
              {view === "review" ? (
                <>
                  <GitBranch size={22} color="#3b82f6" /> Review Changes
                </>
              ) : (
                <>
                  <GitBranch size={22} color="#8b5cf6" /> Version Control
                </>
              )}
            </h2>
            {view === "main" && (
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                Manage snapshots and sync your vault remotely.
              </p>
            )}
          </div>
          <button
            onClick={() => setGitModalOpen(false)}
            style={iconBtnStyle}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {view === "review" ? (
          <div style={{ padding: "24px 32px" }}>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              Commit Message
            </h3>
            <input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: "24px",
                padding: "10px 14px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            />

            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              Uncommitted Changes ({uncommittedChanges.length})
            </h3>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "12px",
                color: "var(--text-secondary)",
                opacity: 0.8,
              }}
            >
              The following files will be committed and pushed to your remote
              repository.
            </p>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                marginBottom: "24px",
                background: "var(--bg-secondary)",
              }}
            >
              {uncommittedChanges.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                  }}
                >
                  No uncommitted changes to sync.
                </div>
              ) : (
                uncommittedChanges.map((change, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom:
                        i === uncommittedChanges.length - 1
                          ? "none"
                          : "1px solid var(--glass-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                        marginRight: "16px",
                      }}
                    >
                      <FileText
                        size={16}
                        color="var(--text-secondary)"
                        opacity={0.7}
                      />
                      <span
                        style={{
                          fontSize: "13.5px",
                          color: "var(--text-primary)",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setView("main")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid var(--glass-border)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSync}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#007aff",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "32px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-secondary)",
                }}
              >
                Checking status...
              </div>
            ) : !isRepo ? (
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
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
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
                  This vault is not currently initialized as a Git repository.
                  Enable version control to keep track of every edit over time.
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
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
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
                    <h3
                      style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}
                    >
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
                    Save all your current modifications to the local Git
                    history. You can view history later from the command
                    palette.
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
                    <h3
                      style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}
                    >
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
                    Push your local commits and pull any new changes from the
                    remote server. Ensure you have configured a remote origin.
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
