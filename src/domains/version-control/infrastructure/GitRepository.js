/**
 * @fileoverview Git infrastructure adapter.
 * Wraps Neutralino shell commands. Single place for all git operations.
 */

import { Logger } from "../../../core/infrastructure/Logger";
import {
  GitCommandError,
  GitNotInitializedError,
  GitSyncError,
} from "../../../core/errors/index.js";

/**
 * Git operations adapter using Neutralino os.execCommand.
 */
class GitRepository {
  constructor() {
    this._log = Logger.forContext("GitRepository");
  }

  /**
   * Executes a git command in a given repository path.
   * @param {string} repoPath - Absolute path to the repository root
   * @param {string} args - Git arguments string
   * @returns {Promise<string>} stdout
   */
  async exec(repoPath, args) {
    if (!repoPath) throw new GitNotInitializedError();
    const command = `git -C "${repoPath}" ${args}`;
    this._log.debug(`Executing: ${command}`);

    try {
      const response = await window.Neutralino.os.execCommand(command, {
        background: false,
      });
      if (response.exitCode !== 0) {
        throw new GitCommandError(command, response.stdErr ?? response.stdOut);
      }
      return response.stdOut ?? "";
    } catch (err) {
      if (err instanceof GitCommandError) throw err;
      throw new GitCommandError(command, err.message ?? "", err);
    }
  }

  /**
   * Checks if a directory is a git repository.
   * @param {string} repoPath
   * @returns {Promise<boolean>}
   */
  async isRepo(repoPath) {
    try {
      await this.exec(repoPath, "status");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initializes a new git repository.
   * @param {string} repoPath
   */
  async init(repoPath) {
    await this.exec(repoPath, "init");
  }

  /**
   * Gets the uncommitted changes in the repository.
   * @param {string} repoPath
   * @returns {Promise<Array<{file: string, status: string}>>}
   */
  async getStatus(repoPath) {
    try {
      const output = await this.exec(repoPath, "status --porcelain");
      if (!output || !output.trim()) return [];

      return output
        .trim()
        .split("\n")
        .map((line) => {
          const statusCode = line.substring(0, 2);
          const file = line.substring(3).trim();

          let status = "Modified";
          if (statusCode.includes("A") || statusCode.includes("?"))
            status = "Added";
          else if (statusCode.includes("D")) status = "Deleted";
          else if (statusCode.includes("R")) status = "Renamed";

          return { file, status };
        });
    } catch (e) {
      return [];
    }
  }

  /**
   * Stages all changes and creates a commit.

   * @param {string} repoPath
   * @param {string} message
   */
  async commitAll(repoPath, message = "Update notes") {
    await this.exec(repoPath, "add .");
    try {
      await this.exec(repoPath, `commit -m "${message}"`);
    } catch (err) {
      // "nothing to commit" is not a real error
      if (!err.stderr?.includes("nothing to commit")) throw err;
    }
  }

  /**
   * Pulls and pushes from/to origin main.
   * @param {string} repoPath
   */
  async sync(repoPath) {
    try {
      await this.commitAll(repoPath, "Auto sync commit");
      await this.exec(repoPath, "pull --rebase origin main").catch(() => {});
      await this.exec(repoPath, "push origin main");
    } catch (err) {
      throw new GitSyncError(err);
    }
  }

  /**
   * Returns commit history for a specific file.
   * @param {string} repoPath
   * @param {string} filePath - Relative path within the repo
   * @returns {Promise<Array<{hash: string, author: string, date: string, subject: string}>>}
   */
  async getFileHistory(repoPath, filePath) {
    try {
      const log = await this.exec(
        repoPath,
        `log --pretty=format:"%H|%an|%ad|%s" --date=format:"%d/%m/%Y, %H:%M:%S" -- "${filePath}"`,
      );
      if (!log?.trim()) return [];
      return log
        .trim()
        .split("\n")
        .map((line) => {
          const [hash, author, date, ...subjectParts] = line.split("|");
          return { hash, author, date, subject: subjectParts.join("|") };
        });
    } catch {
      return [];
    }
  }

  /**
   * Gets file content at a specific commit.
   * @param {string} repoPath
   * @param {string} hash - Commit hash
   * @param {string} filePath - Relative path within the repo
   * @returns {Promise<string>}
   */
  async getFileAtCommit(repoPath, hash, filePath) {
    return await this.exec(repoPath, `show ${hash}:"${filePath}"`);
  }
}

/** Singleton git repository adapter */
export const gitRepository = new GitRepository();
