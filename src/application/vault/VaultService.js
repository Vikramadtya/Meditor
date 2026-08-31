/**
 * @fileoverview Application Service for vault lifecycle operations.
 * Orchestrates between SqliteVaultRepository and NeutralinoFileSystem.
 * No UI logic, no Zustand access — purely orchestration.
 */

import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { Logger } from "../../infrastructure/Logger.js";
import { fileSystem } from "../../infrastructure/NeutralinoFileSystem.js";
import { vaultRepository } from "../../infrastructure/SqliteVaultRepository.js";
import { VaultInitError, VaultLoadError } from "../../domain/errors/index.js";
import { generateId } from "../../utils/generateId.js";

/**
 * Vault lifecycle service — init, load, save, hierarchy.
 */
export class VaultService {
  constructor() {
    this._log = Logger.forContext("VaultService");
    this._sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
    /** @type {string|null} */
    this.vaultPath = null;
  }

  /**
   * Initializes a brand-new vault at the given folder path.
   * @param {string} folderPath
   */
  async initVault(folderPath) {
    try {
      if (await fileSystem.exists(`${folderPath}/vault.db`)) {
        throw new Error("Vault already exists. Will not overwrite.");
      }

      const SQL = await this._sqlPromise;
      const db = new SQL.Database();
      vaultRepository.attach(db);
      vaultRepository.createSchema();
      this.vaultPath = folderPath;

      await fileSystem.createDirectory(`${folderPath}/notes`);
      await fileSystem.createDirectory(`${folderPath}/assets`);

      await this.save();
      this._log.info(`Initialized new vault at ${folderPath}`);
    } catch (err) {
      throw new VaultInitError(folderPath, err);
    }
  }

  /**
   * Loads an existing vault.db from disk.
   * @param {string} folderPath
   * @returns {Promise<boolean>} True if vault loaded successfully
   */
  async loadVault(folderPath) {
    try {
      const SQL = await this._sqlPromise;
      const buffer = await fileSystem.readBinaryFile(`${folderPath}/vault.db`);
      const db = new SQL.Database(new Uint8Array(buffer));
      vaultRepository.attach(db);
      this.vaultPath = folderPath;

      await this.save();
      this._log.info(`Loaded vault from ${folderPath}`);
      return true;
    } catch (err) {
      this._log.error(`Failed to load vault from ${folderPath}`, err);
      return false;
    }
  }

  /**
   * Persists the in-memory database to disk.
   */
  async save() {
    if (!this.vaultPath || !vaultRepository.db) return;
    try {
      const data = vaultRepository.export();
      await fileSystem.writeBinaryFile(`${this.vaultPath}/vault.db`, data);
    } catch (err) {
      this._log.error("Failed to save vault", err);
    }
  }

  /**
   * Returns the full vault hierarchy tree.
   * @returns {Array<Object>}
   */
  getHierarchy() {
    return vaultRepository.getHierarchy();
  }

  getAgendaNotes() {
    return vaultRepository.getAgendaNotes();
  }

  async updateNoteSRS(noteId, ease, interval, nextReview) {
    vaultRepository.updateNoteSRS(noteId, ease, interval, nextReview);
    await this.save();
  }

  // ─── Create operations ───────────────────────────────────────────────────

  async createGroup(name, metadata = {}, orderIndex = null) {
    const id = generateId();
    const rows = vaultRepository._queryAll("SELECT COUNT(*) as c FROM groups");
    const order =
      orderIndex !== null && orderIndex !== ""
        ? parseInt(orderIndex, 10)
        : (rows[0]?.c ?? 0);
    vaultRepository.insertGroup(id, name, order);
    vaultRepository.updateItemNameAndMetadata(
      "groups",
      id,
      name,
      JSON.stringify(metadata),
    );
    await this.save();
    return id;
  }

  async updateItem(type, id, name, orderIndex = null, metadata = {}) {
    let table = type + "s";
    if (type === "collection") table = "collections";

    vaultRepository.updateItemNameAndMetadata(
      table,
      id,
      name,
      JSON.stringify(metadata),
    );
    if (orderIndex !== null && orderIndex !== "") {
      vaultRepository.db.run(
        `UPDATE ${table} SET order_index = ? WHERE id = ?`,
        [parseInt(orderIndex, 10), id],
      );
    }
    await this.save();
  }

  async createCollection(groupId, name, metadata = {}, orderIndex = null) {
    const id = generateId();
    const order =
      orderIndex !== null && orderIndex !== ""
        ? parseInt(orderIndex, 10)
        : vaultRepository._nextOrder("collections", "group_id", groupId);
    vaultRepository.insertCollection(id, groupId, name, order);
    vaultRepository.updateItemNameAndMetadata(
      "collections",
      id,
      name,
      JSON.stringify(metadata),
    );
    await this.save();
    return id;
  }

  async createModule(collectionId, name, orderIndex = null, metadata = {}) {
    const id = generateId();
    const order =
      orderIndex !== null && orderIndex !== ""
        ? parseInt(orderIndex, 10)
        : vaultRepository._nextOrder("modules", "collection_id", collectionId);
    vaultRepository.insertModule(id, collectionId, name, order);
    vaultRepository.updateItemNameAndMetadata(
      "modules",
      id,
      name,
      JSON.stringify(metadata),
    );
    await this.save();
    return id;
  }

  async createNote(moduleId, name, orderIndex = null) {
    const id = generateId();
    const order =
      orderIndex !== null && orderIndex !== ""
        ? parseInt(orderIndex, 10)
        : vaultRepository._nextOrder("notes", "module_id", moduleId);
    const now = Date.now();
    vaultRepository.insertNote(id, moduleId, name, order, now);

    // Build the full hierarchy path from DB after inserting
    const relPath = vaultRepository.getNoteFsPath(id);
    if (!relPath) throw new Error(`Could not resolve path for note "${name}"`);

    const fullPath = `${this.vaultPath}/${relPath}`;
    // Ensure parent directories exist
    const parentDir = fullPath.substring(0, fullPath.lastIndexOf("/"));
    await fileSystem.createDirectory(parentDir);
    await fileSystem.writeFile(fullPath, `# ${name}\n`);

    await this.save();
    return id;
  }

  /**
   * Resolves the full filesystem path for a note.
   * @param {string} noteId
   * @returns {string|null}
   */
  getNotePath(noteId) {
    const relPath = vaultRepository.getNoteFsPath(noteId);
    if (!relPath || !this.vaultPath) return null;
    return `${this.vaultPath}/${relPath}`.replace(/\/{2,}/g, "/");
  }

  // ─── Delete operations ───────────────────────────────────────────────────

  async deleteItem(type, id, hard = false) {
    if (type === "note") {
      // Resolve the path BEFORE deleting the DB record
      const filePath = this.getNotePath(id);
      vaultRepository.deleteNote(id, !hard);
      if (hard && filePath) {
        try {
          await fileSystem.removeFile(filePath);
        } catch (_) {}
      }
    } else if (type === "module") {
      const noteIds = vaultRepository
        ._queryAll("SELECT id FROM notes WHERE module_id=?", [id])
        .map((r) => r.id);
      vaultRepository.deleteModule(id, noteIds);
    } else if (type === "collection") {
      const moduleRows = vaultRepository._queryAll(
        "SELECT id FROM modules WHERE collection_id=?",
        [id],
      );
      const notesByModule = {};
      for (const { id: mid } of moduleRows) {
        notesByModule[mid] = vaultRepository
          ._queryAll("SELECT id FROM notes WHERE module_id=?", [mid])
          .map((r) => r.id);
      }
      vaultRepository.deleteCollection(
        id,
        moduleRows.map((r) => r.id),
        notesByModule,
      );
    } else if (type === "group") {
      const colRows = vaultRepository._queryAll(
        "SELECT id FROM collections WHERE group_id=?",
        [id],
      );
      const modulesByCol = {};
      const notesByModule = {};
      for (const { id: cid } of colRows) {
        const modRows = vaultRepository._queryAll(
          "SELECT id FROM modules WHERE collection_id=?",
          [cid],
        );
        modulesByCol[cid] = modRows.map((r) => r.id);
        for (const { id: mid } of modRows) {
          notesByModule[mid] = vaultRepository
            ._queryAll("SELECT id FROM notes WHERE module_id=?", [mid])
            .map((r) => r.id);
        }
      }
      vaultRepository.deleteGroup(
        id,
        colRows.map((r) => r.id),
        modulesByCol,
        notesByModule,
      );
    }
    await this.save();
  }

  async restoreNote(id) {
    vaultRepository.restoreNote(id);
    await this.save();
  }

  async addImage(noteId, fileName, imageData) {
    const id = generateId();
    await fileSystem.writeBinaryFile(
      `${this.vaultPath}/assets/${fileName}`,
      imageData,
    );
    vaultRepository.insertImage(id, noteId, fileName, Date.now());
    await this.save();
    return fileName;
  }

  getLogicalPath(noteId) {
    return vaultRepository.getLogicalPath(noteId);
  }

  getDeletedNotes() {
    return vaultRepository.findDeletedNotes();
  }
}

/** Singleton vault service */
export const vaultService = new VaultService();
