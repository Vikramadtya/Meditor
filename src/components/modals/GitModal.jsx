import { useShallow } from "zustand/react/shallow";
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
import { selectRepoPath } from "../../store/selectors/vault.selectors";
import { gitService } from "../../application/git/GitService";
import {
  iconBtnStyle,
  chipStyle,
  inputStyle,
} from "../Settings/SettingsStyles";
import toast from "react-hot-toast";
import { GitStatusView } from "./git/GitStatusView";
import { GitDiffViewer } from "./git/GitDiffViewer";
import { GitCommitForm } from "./git/GitCommitForm";

/**
 * Modal component for managing Git operations within the vault.
 * Provides UI for initializing a repository, committing changes, and syncing with a remote.
 *
 * @returns {React.ReactElement|null} The Git management modal or null if not open.
 */
export default function GitModal() {
  const repoPath = useStore(selectRepoPath);
  const { isGitModalOpen, setGitModalOpen } = useStore(
    useShallow((s) => ({
      isGitModalOpen: s.isGitModalOpen,
      setGitModalOpen: s.setGitModalOpen,
    })),
  );
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
    if (!repoPath) {
      setIsRepo(false);
      setLoading(false);
      return;
    }
    const repoExists = await gitService.isRepo(repoPath);
    setIsRepo(repoExists);
    if (repoExists) {
      try {
        const changes = await gitService.getStatus(repoPath);
        setUncommittedChanges(changes);
      } catch (e) {
        console.error("Failed to get status", e);
      }
    }
    setLoading(false);
  };
  const handleInit = async () => {
    try {
      await gitService.initRepo(repoPath);
      toast.success("Git repository initialized!");
      checkRepo();
    } catch (e) {
      toast.error("Failed to initialize git");
    }
  };
  const handleCommitAll = async () => {
    try {
      await gitService.commitAll(repoPath, "Manual commit from Meditor");
      toast.success("Saved to Git History!");
    } catch (e) {
      toast.error("Nothing to commit, or error occurred");
    }
  };
  const handleReviewSync = async () => {
    toast.loading("Gathering changes...", {
      id: "sync-prep",
    });
    try {
      const changes = await gitService.getStatus(repoPath);
      setUncommittedChanges(changes);
      setView("review");
      toast.dismiss("sync-prep");
    } catch (e) {
      toast.error("Failed to gather status", {
        id: "sync-prep",
      });
    }
  };
  const handleConfirmSync = async () => {
    try {
      toast.loading("Committing & Syncing...", {
        id: "sync",
      });
      if (uncommittedChanges.length > 0) {
        await gitService.commitAll(repoPath, commitMessage);
      }
      await gitService.sync(repoPath);
      toast.success("Synced successfully!", {
        id: "sync",
      });
      setView("main");
      setGitModalOpen(false);
    } catch (e) {
      toast.error("Sync failed. Check remote configuration.", {
        id: "sync",
      });
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
          <div
            style={{
              padding: "24px 32px",
            }}
          >
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

            <GitDiffViewer uncommittedChanges={uncommittedChanges} />
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
          <div
            style={{
              padding: "32px",
            }}
          >
            <GitStatusView
              loading={loading}
              isRepo={isRepo}
              handleInit={handleInit}
              handleCommitAll={handleCommitAll}
              handleReviewSync={handleReviewSync}
              uncommittedChanges={uncommittedChanges}
            />
          </div>
        )}
      </div>
    </div>
  );
}
