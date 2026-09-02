const fs = require('fs');
let file = fs.readFileSync('src/components/modals/GitModal.jsx', 'utf8');

// Replace handleCommitAll and handleReviewSync definitions
file = file.replace(
  /const handleCommitAll = async \(\) => {[\s\S]*?};\n\s*const handleReviewSync = async \(\) => {[\s\S]*?};\n\s*const handleConfirmSync = async \(\) => {[\s\S]*?};/,
  `const handleReviewCommit = async () => {
    toast.loading("Gathering changes...", { id: "commit-prep" });
    try {
      const changes = await gitService.getStatus(repoPath);
      setUncommittedChanges(changes);
      setCommitMessage("Manual commit from Meditor");
      setView("review");
      toast.dismiss("commit-prep");
    } catch (e) {
      toast.error("Failed to gather status", { id: "commit-prep" });
    }
  };
  const handleSyncVault = async () => {
    toast.loading("Syncing with origin/main...", { id: "sync" });
    try {
      await gitService.sync(repoPath);
      toast.success("Synced successfully!", { id: "sync" });
      setGitModalOpen(false);
    } catch (e) {
      toast.error("Sync failed. Check remote configuration.", { id: "sync" });
    }
  };
  const handleConfirmCommit = async () => {
    try {
      toast.loading("Committing...", { id: "commit" });
      if (uncommittedChanges.length > 0) {
        await gitService.commitAll(repoPath, commitMessage);
        toast.success("Committed successfully!", { id: "commit" });
      } else {
        toast.success("Nothing to commit.", { id: "commit" });
      }
      setView("main");
    } catch (e) {
      toast.error("Commit failed.", { id: "commit" });
    }
  };`
);

// Replace the Confirm & Sync button
file = file.replace(
  '<button\n                onClick={handleConfirmSync}',
  '<button\n                onClick={handleConfirmCommit}'
);
file = file.replace(
  'Confirm & Sync\n              </button>',
  'Confirm Commit\n              </button>'
);

// Replace GitStatusView props
file = file.replace(
  'handleCommitAll={handleCommitAll}\n              handleReviewSync={handleReviewSync}',
  'handleReviewCommit={handleReviewCommit}\n              handleSyncVault={handleSyncVault}'
);

fs.writeFileSync('src/components/modals/GitModal.jsx', file);
