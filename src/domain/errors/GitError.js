import { AppError } from "./AppError.js";

/** Errors from Git operations. */
export class GitError extends AppError {
  constructor(message, code = "GIT_ERROR", cause = null) {
    super(message, code, cause);
  }
}

export class GitNotInitializedError extends GitError {
  constructor() {
    super("This vault is not a Git repository.", "GIT_NOT_INITIALIZED");
  }
}

export class GitCommandError extends GitError {
  constructor(command, stderr, cause = null) {
    super(
      `Git command failed: ${command}\n${stderr}`,
      "GIT_COMMAND_FAILED",
      cause,
    );
    this.command = command;
    this.stderr = stderr;
  }
}

export class GitSyncError extends GitError {
  constructor(cause = null) {
    super(
      "Failed to sync with remote. Check your remote configuration.",
      "GIT_SYNC_FAILED",
      cause,
    );
  }
}
