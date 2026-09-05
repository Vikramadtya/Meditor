import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";
import { Logger } from "../../../core/infrastructure/Logger";

import { syncVaultCommand } from "./VaultSyncUseCase";
import { getFolderContentsCommand } from "./VaultQueryUseCase";
import {
  createContainerCommand,
  createNoteCommand,
  deleteItemCommand,
  renameItemCommand,
} from "./VaultMutationUseCase";

class VaultService {
  constructor() {
    this.vaultPath = null;
    this.db = null; // The actual SQL.Database instance
    this._sqlPromise = null;
    this.isSyncing = false;
    this._log = Logger.forContext("VaultService");
    this._listeners = new Set();
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  notify(path) {
    for (let cb of this._listeners) {
      try {
        cb(path);
      } catch (e) {
        this._log.error(e);
      }
    }
  }

  async init(sqlPromise) {
    this._sqlPromise = sqlPromise;
  }

  async _getSqlModule() {
    if (!this._sqlPromise)
      throw new Error("SQL Promise not provided to VaultService");
    return await this._sqlPromise;
  }

  async initVault(folderPath) {
    const SQL = await this._getSqlModule();
    const notesPath = `${folderPath}/notes`;
    try {
      const stats = await window.Neutralino.filesystem.getStats(notesPath);
      if (!stats.isDirectory) throw new Error("Not a directory");
    } catch (e) {
      await window.Neutralino.filesystem.createDirectory(notesPath);
    }

    this.db = new SQL.Database();
    vaultRepository.attach(this.db);
    this.vaultPath = folderPath;

    let rootMeta = {};
    try {
      const metaStr = await fileSystem.readFile(`${notesPath}/.metadata`);
      rootMeta = JSON.parse(metaStr);
    } catch (e) {
      rootMeta = { id: "notes", type: "container", children_order: [] };
      await fileSystem.writeFile(
        `${notesPath}/.metadata`,
        JSON.stringify(rootMeta, null, 2),
      );
    }

    vaultRepository.upsertContainer({
      id: "notes",
      path: "notes",
      name: "notes",
      metadata: rootMeta,
    });

    await this.saveVault();
  }

  async loadVault(folderPath) {
    const SQL = await this._getSqlModule();

    try {
      const notesPath = `${folderPath}/notes`;
      await window.Neutralino.filesystem.getStats(notesPath);
    } catch (e) {
      throw new Error("Invalid vault: missing 'notes' directory.");
    }

    let buffer;
    try {
      buffer = await fileSystem.readBinaryFile(
        `${folderPath}/.meditor/vault.sqlite`,
      );
    } catch (e) {
      try {
        buffer = await fileSystem.readBinaryFile(`${folderPath}/vault.db`); // legacy fallback
      } catch (err) {
        this._log.warn("No existing vault DB found, creating new.");
        const newDb = new SQL.Database();
        buffer = newDb.export();
        await window.Neutralino.filesystem
          .createDirectory(`${folderPath}/.meditor`)
          .catch(() => {});
        await fileSystem.writeBinaryFile(
          `${folderPath}/.meditor/vault.sqlite`,
          buffer,
        );
      }
    }

    this.db = new SQL.Database(new Uint8Array(buffer));
    vaultRepository.attach(this.db);
    this.vaultPath = folderPath;

    this._log.info(`Vault loaded at ${folderPath}`);
    this.syncVault().catch((e) => this._log.error("Sync failed", e));
    return true;
  }

  async saveVault() {
    if (this.db && this.vaultPath) {
      const data = this.db.export();
      const buffer = new Uint8Array(data).buffer;
      await window.Neutralino.filesystem
        .createDirectory(`${this.vaultPath}/.meditor`)
        .catch(() => {});
      await window.Neutralino.filesystem.writeBinaryFile(
        `${this.vaultPath}/.meditor/vault.sqlite`,
        buffer,
      );
    }
  }

  async getFolderContents(relPath = "notes") {
    return getFolderContentsCommand(this.vaultPath, relPath, this._log);
  }

  async syncVault() {
    if (!this.vaultPath || this.isSyncing) return;
    this.isSyncing = true;
    try {
      await syncVaultCommand(this.vaultPath, this._log);
      await this.saveVault();
    } catch (e) {
      this._log.error("Error during syncVault", e);
    } finally {
      this.isSyncing = false;
    }
  }

  async createContainer(parentRelPath, name) {
    const meta = await createContainerCommand(
      this.vaultPath,
      parentRelPath,
      name,
    );
    await this.saveVault();
    this.notify(parentRelPath);
    return meta;
  }

  async createNote(parentRelPath, name) {
    const noteMeta = await createNoteCommand(
      this.vaultPath,
      parentRelPath,
      name,
    );
    await this.saveVault();
    this.notify(parentRelPath);
    return noteMeta;
  }

  async renameItem(type, id, oldRelPath, newName) {
    if (!this.db) return;
    await renameItemCommand(this.vaultPath, type, id, oldRelPath, newName);
    await this.saveVault();
    // Re-sync vault to fix paths for nested notes if a directory was renamed
    if (type === "container") {
      await this.syncVault();
    }

    // Notify old parent to refresh
    if (oldRelPath) {
      const parentRelPath = oldRelPath.substring(
        0,
        oldRelPath.lastIndexOf("/"),
      );
      this.notify(parentRelPath);
    }
  }

  async deleteItem(type, id, relPath, hard = false) {
    await deleteItemCommand(this.vaultPath, type, id, relPath, hard);
    await this.saveVault();
    if (relPath) {
      const parentRelPath = relPath.substring(0, relPath.lastIndexOf("/"));
      this.notify(parentRelPath);
    }
  }

  getNotePath(noteId) {
    const n = vaultRepository.getNoteById(noteId);
    if (n && n.path && this.vaultPath) {
      return `${this.vaultPath}/${n.path}`;
    }
    return null;
  }

  async updateNoteSRS(noteId, ease, interval, nextReview) {
    const n = vaultRepository.getNoteById(noteId);
    if (!n) return;
    vaultRepository._run(
      "UPDATE notes SET srs_ease=?, srs_interval=?, srs_next_review=? WHERE id=?",
      [ease, interval, nextReview, noteId],
    );
    await this.saveVault();
  }
}

export const vaultService = new VaultService();
