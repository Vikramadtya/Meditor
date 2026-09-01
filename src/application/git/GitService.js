/**
 * @fileoverview Application Service for Git operations.
 * Wraps GitRepository, provides user-facing error messages, and decouples
 * the store/components from raw git infrastructure.
 */

import { Logger } from "../../infrastructure/Logger.js";
import { gitRepository } from "../../infrastructure/GitRepository.js";
import { GitError } from "../../domain/errors/index.js";

class GitService {
  constructor() {
    this._log = Logger.forContext("GitService");
  }

  /**
   * @param {string} repoPath
   * @returns {Promise<boolean>}
   */
  async isRepo(repoPath) {
    return gitRepository.isRepo(repoPath);
  }

  /** @param {string} repoPath */
  async initRepo(repoPath) {
    await gitRepository.init(repoPath);
    this._log.info(`Initialized git repo at ${repoPath}`);
  }

  /** @param {string} repoPath */
  async getStatus(repoPath) {
    return gitRepository.getStatus(repoPath);
  }

  /** @param {string} repoPath @param {string} [message] */

  async commitAll(repoPath, message = "Manual commit from Meditor") {
    await gitRepository.commitAll(repoPath, message);
    this._log.info(`Committed all changes at ${repoPath}`);
  }

  /** @param {string} repoPath */
  async sync(repoPath) {
    this._log.info(`Starting sync for ${repoPath}`);
    await gitRepository.sync(repoPath);
    this._log.info(`Sync complete for ${repoPath}`);
  }

  /**
   * @param {string} repoPath
   * @param {string} relFilePath
   */
  async getFileHistory(repoPath, relFilePath) {
    return gitRepository.getFileHistory(repoPath, relFilePath);
  }

  /**
   * @param {string} repoPath
   * @param {string} hash
   * @param {string} relFilePath
   */
  async getFileAtCommit(repoPath, hash, relFilePath) {
    return gitRepository.getFileAtCommit(repoPath, hash, relFilePath);
  }
}

export const gitService = new GitService();
