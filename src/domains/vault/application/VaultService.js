import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";
import { Logger } from "../../../core/infrastructure/Logger";

import { syncVaultCommand } from "./VaultSyncUseCase";
import { getFolderContentsCommand } from "./VaultQueryUseCase";
import {
  createContainerCommand,
  createNoteCommand,
  deleteItemCommand,
} from "./VaultMutationUseCase";

class VaultService {
  constructor() {
    this.vaultPath = null;
    this.db = null;
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
    this.db = await sqlPromise;
    vaultRepository.init(this.db);
  }

  async initVault(folderPath) {
    if (!this.db) throw new Error("Vault DB not initialized");
    const notesPath = `${folderPath}/notes`;
    try {
      const stats = await window.Neutralino.filesystem.getStats(notesPath);
      if (!stats.isDirectory) throw new Error("Not a directory");
    } catch (e) {
      await window.Neutralino.filesystem.createDirectory(notesPath);
    }

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
    this.vaultPath = folderPath;
    vaultRepository.upsertContainer({
      id: "notes",
      path: "notes",
      name: "notes",
      metadata: rootMeta,
    });
  }

  async loadVault(folderPath) {
    if (!this.db) throw new Error("Vault DB not initialized");
    this.vaultPath = folderPath;
    try {
      const notesPath = `${folderPath}/notes`;
      await window.Neutralino.filesystem.getStats(notesPath);
    } catch (e) {
      throw new Error("Invalid vault: missing 'notes' directory.");
    }
    this._log.info(`Vault loaded at ${folderPath}`);
    // Sync runs asynchronously
    this.syncVault().catch((e) => this._log.error("Sync failed", e));
  }

  async saveVault() {
    if (this.db) {
      const data = this.db.export();
      const buffer = new Uint8Array(data).buffer;
      if (this.vaultPath) {
        await window.Neutralino.filesystem.writeBinaryFile(
          `${this.vaultPath}/.meditor/vault.sqlite`,
          buffer,
        );
      }
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

  async deleteItem(type, id, relPath, hard = true) {
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
