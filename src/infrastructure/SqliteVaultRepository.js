/**
 * @fileoverview Repository pattern implementation for the vault SQLite database.
 * This is the ONLY class that runs SQL queries. No other file should call db.exec/run directly.
 *
 * Implements Single Responsibility: only concerned with data persistence.
 */

import { Logger } from "./Logger.js";
import {
  VaultNotLoadedError,
  NoteNotFoundError,
} from "../domain/errors/index.js";

/**
 * @typedef {Object} NoteRow
 * @property {string} id
 * @property {string} module_id
 * @property {string} name
 * @property {number} order_index
 * @property {number} created_at
 * @property {number} updated_at
 * @property {number} is_deleted
 * @property {number} [is_favorite]
 * @property {string} [tags]
 * @property {string} [flashcard_question]
 * @property {string} [flashcard_answer]
 */

/**
 * Repository for all SQLite vault operations.
 */
export class SqliteVaultRepository {
  constructor() {
    this._log = Logger.forContext("SqliteVaultRepository");
    /** @type {import('sql.js').Database|null} */
    this.db = null;
  }

  /**
   * Attaches a loaded sql.js Database instance.
   * @param {import('sql.js').Database} db
   */
  attach(db) {
    this.db = db;
    this._runMigrations();
  }

  detach() {
    this.db = null;
  }

  /** @private */
  _assertDb() {
    if (!this.db) throw new VaultNotLoadedError();
  }

  /**
   * Runs all schema migrations idempotently.
   * @private
   */
  _runMigrations() {
    const migrations = [
      "ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0",
      "CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, note_id TEXT, file_name TEXT, created_at INTEGER)",
      "ALTER TABLE groups ADD COLUMN metadata TEXT DEFAULT '{}'",
      "ALTER TABLE collections ADD COLUMN metadata TEXT DEFAULT '{}'",
      "ALTER TABLE modules ADD COLUMN metadata TEXT DEFAULT '{}'",
      "ALTER TABLE notes ADD COLUMN is_favorite INTEGER DEFAULT 0",
      "ALTER TABLE notes ADD COLUMN tags TEXT DEFAULT ''",
      "ALTER TABLE notes ADD COLUMN flashcard_question TEXT DEFAULT ''",
      "ALTER TABLE notes ADD COLUMN flashcard_answer TEXT DEFAULT ''",
      "ALTER TABLE notes ADD COLUMN srs_ease REAL DEFAULT 2.5",
      "ALTER TABLE notes ADD COLUMN srs_interval INTEGER DEFAULT 0",
      "ALTER TABLE notes ADD COLUMN srs_next_review INTEGER DEFAULT 0",
      "ALTER TABLE notes ADD COLUMN agenda_date INTEGER DEFAULT 0",
    ];

    for (const sql of migrations) {
      try {
        this.db.run(sql);
      } catch (_) {
        /* Column already exists */
      }
    }
    this._log.debug("Migrations applied");
  }

  // ─── Schema Creation ──────────────────────────────────────────────────────

  createSchema() {
    this._assertDb();
    this.db.run(`
      CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, name TEXT, order_index INTEGER, metadata TEXT DEFAULT '{}');
      CREATE TABLE IF NOT EXISTS collections (id TEXT PRIMARY KEY, group_id TEXT, name TEXT, order_index INTEGER, metadata TEXT DEFAULT '{}');
      CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, collection_id TEXT, name TEXT, order_index INTEGER, metadata TEXT DEFAULT '{}');
      CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, module_id TEXT, name TEXT, order_index INTEGER, created_at INTEGER, updated_at INTEGER, is_deleted INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, note_id TEXT, file_name TEXT, created_at INTEGER);
    `);
  }

  // ─── Hierarchy ────────────────────────────────────────────────────────────

  /**
   * Builds the full vault hierarchy as a nested JS object tree.
   * @returns {Array<Object>}
   */
  getHierarchy() {
    this._assertDb();
    try {
      const groups = this._queryAll(
        "SELECT * FROM groups ORDER BY order_index",
      );
      return groups.map((g) => ({
        ...g,
        type: "group",
        children: this._getCollectionsForGroup(g.id),
      }));
    } catch (err) {
      this._log.error("Failed to build hierarchy", err);
      return [];
    }
  }

  /** @private */
  _getCollectionsForGroup(groupId) {
    const cols = this._queryAll(
      "SELECT * FROM collections WHERE group_id=? ORDER BY order_index",
      [groupId],
    );
    return cols.map((c) => ({
      ...c,
      type: "collection",
      children: this._getModulesForCollection(c.id),
    }));
  }

  /** @private */
  _getModulesForCollection(collectionId) {
    const mods = this._queryAll(
      "SELECT * FROM modules WHERE collection_id=? ORDER BY order_index",
      [collectionId],
    );
    return mods.map((m) => ({
      ...m,
      type: "module",
      children: this._getNotesForModule(m.id),
    }));
  }

  /** @private */
  _getNotesForModule(moduleId) {
    const notes = this._queryAll(
      "SELECT * FROM notes WHERE module_id=? AND is_deleted=0 ORDER BY order_index",
      [moduleId],
    );
    return notes.map((n) => ({ ...n, type: "note" }));
  }

  // ─── Note CRUD ────────────────────────────────────────────────────────────

  /** @param {string} id @returns {NoteRow|null} */
  findNoteById(id) {
    this._assertDb();
    const rows = this._queryAll(
      "SELECT * FROM notes WHERE id=? AND is_deleted=0",
      [id],
    );
    return rows[0] ?? null;
  }

  /** @returns {NoteRow[]} */
  findFavoriteNotes() {
    this._assertDb();
    return this._queryAll(
      "SELECT * FROM notes WHERE is_favorite=1 AND is_deleted=0 ORDER BY name ASC",
    );
  }

  /** @returns {NoteRow[]} */
  findDeletedNotes() {
    this._assertDb();
    return this._queryAll(
      "SELECT * FROM notes WHERE is_deleted=1 ORDER BY updated_at DESC",
    );
  }

  /** @returns {NoteRow[]} */
  findNotesCreatedToday() {
    this._assertDb();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this._queryAll(
      "SELECT * FROM notes WHERE created_at >= ? AND is_deleted=0 ORDER BY created_at DESC",
      [startOfDay.getTime()],
    );
  }

  /** @returns {NoteRow[]} */
  findAllNotes() {
    this._assertDb();
    return this._queryAll(
      "SELECT * FROM notes WHERE is_deleted=0 ORDER BY updated_at DESC",
    );
  }

  /**
   * @param {string} moduleId
   * @param {string} name
   * @param {string} id
   */
  insertNote(id, moduleId, name, orderIndex, now) {
    this._assertDb();
    this.db.run(
      "INSERT INTO notes (id, module_id, name, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, moduleId, name, orderIndex, now, now],
    );
  }

  /** @param {string} noteId @param {boolean} soft */
  deleteNote(noteId, soft = true) {
    this._assertDb();
    if (soft) {
      this.db.run("UPDATE notes SET is_deleted=1 WHERE id=?", [noteId]);
    } else {
      this.db.run("DELETE FROM notes WHERE id=?", [noteId]);
    }
  }

  /** @param {string} noteId */
  restoreNote(noteId) {
    this._assertDb();
    this.db.run("UPDATE notes SET is_deleted=0 WHERE id=?", [noteId]);
  }

  /** @param {string} noteId */
  toggleFavorite(noteId) {
    this._assertDb();
    this.db.run(
      "UPDATE notes SET is_favorite=CASE WHEN is_favorite=1 THEN 0 ELSE 1 END WHERE id=?",
      [noteId],
    );
  }

  /** @param {string} noteId @returns {boolean} */
  isFavorite(noteId) {
    this._assertDb();
    const res = this.db.exec("SELECT is_favorite FROM notes WHERE id=?", [
      noteId,
    ]);
    return res?.[0]?.values?.[0]?.[0] === 1;
  }

  /**
   * Updates note tags and flashcard fields.
   * @param {string} noteId
   * @param {{ tags: string[], flashcard_question: string, flashcard_answer: string }} meta
   */
  updateNoteMeta(noteId, { tags, flashcard_question, flashcard_answer }) {
    this._assertDb();
    this.db.run(
      "UPDATE notes SET tags=?, flashcard_question=?, flashcard_answer=?, updated_at=? WHERE id=?",
      [
        tags.join(","),
        flashcard_question,
        flashcard_answer,
        Date.now(),
        noteId,
      ],
    );
  }

  /**
   * @param {string} noteId
   * @returns {{ tags: string[], flashcard_question: string, flashcard_answer: string }}
   */
  getNoteMeta(noteId) {
    this._assertDb();
    try {
      const res = this.db.exec(
        "SELECT tags, flashcard_question, flashcard_answer FROM notes WHERE id=?",
        [noteId],
      );
      if (!res[0]?.values[0])
        return { tags: [], flashcard_question: "", flashcard_answer: "" };
      const [tags, fq, fa] = res[0].values[0];
      return {
        tags: tags ? tags.split(",").filter(Boolean) : [],
        flashcard_question: fq ?? "",
        flashcard_answer: fa ?? "",
      };
    } catch {
      return { tags: [], flashcard_question: "", flashcard_answer: "" };
    }
  }

  getAgendaNotes() {
    this._assertDb();
    try {
      const now = Date.now();
      const res = this.db.exec(
        `SELECT id, name, flashcard_question, flashcard_answer, srs_ease, srs_interval, srs_next_review
         FROM notes 
         WHERE is_deleted = 0 
           AND flashcard_question IS NOT NULL 
           AND flashcard_question != '' 
           AND srs_next_review <= ?
         ORDER BY srs_next_review ASC LIMIT 50`,
        [now],
      );
      if (!res[0]?.values) return [];
      return res[0].values.map((row) => ({
        id: row[0],
        name: row[1],
        flashcard_question: row[2],
        flashcard_answer: row[3],
        srs_ease: row[4],
        srs_interval: row[5],
        srs_next_review: row[6],
      }));
    } catch {
      return [];
    }
  }

  updateNoteSRS(noteId, ease, interval, nextReview) {
    this._assertDb();
    this.db.run(
      "UPDATE notes SET srs_ease = ?, srs_interval = ?, srs_next_review = ?, updated_at = ? WHERE id = ?",
      [ease, interval, nextReview, Date.now(), noteId],
    );
  }

  getNotesForDate(dayStart, dayEnd) {
    if (!this.db) return [];
    try {
      return this._queryAll(
        `SELECT * FROM notes WHERE is_deleted=0 AND agenda_date >= ? AND agenda_date < ? ORDER BY agenda_date ASC`,
        [dayStart, dayEnd],
      );
    } catch {
      return [];
    }
  }

  getAgendaDays() {
    if (!this.db) return [];
    try {
      const res = this.db.exec(
        "SELECT DISTINCT agenda_date FROM notes WHERE is_deleted=0 AND agenda_date > 0",
      );
      if (!res[0]?.values) return [];
      return res[0].values.map((r) => r[0]);
    } catch {
      return [];
    }
  }

  setNoteAgendaDate(noteId, dateTs) {
    this._assertDb();
    this.db.run("UPDATE notes SET agenda_date=?, updated_at=? WHERE id=?", [
      dateTs,
      Date.now(),
      noteId,
    ]);
  }

  getAnalytics() {
    if (!this.db) return null;
    try {
      const notes =
        this.db.exec("SELECT COUNT(*) FROM notes WHERE is_deleted=0")?.[0]
          ?.values?.[0]?.[0] ?? 0;
      const flashcards =
        this.db.exec(
          "SELECT COUNT(*) FROM notes WHERE is_deleted=0 AND flashcard_question!='' AND flashcard_question IS NOT NULL",
        )?.[0]?.values?.[0]?.[0] ?? 0;
      const dueToday =
        this.db.exec(
          "SELECT COUNT(*) FROM notes WHERE is_deleted=0 AND srs_next_review>0 AND srs_next_review<=?",
          [Date.now()],
        )?.[0]?.values?.[0]?.[0] ?? 0;
      const groups =
        this.db.exec("SELECT COUNT(*) FROM groups")?.[0]?.values?.[0]?.[0] ?? 0;
      const favorites =
        this.db.exec(
          "SELECT COUNT(*) FROM notes WHERE is_deleted=0 AND is_favorite=1",
        )?.[0]?.values?.[0]?.[0] ?? 0;

      const activityRes = this.db.exec(
        "SELECT created_at, updated_at FROM notes WHERE is_deleted=0",
      );
      const editCounts = {};
      if (activityRes[0]) {
        for (const [ca, ua] of activityRes[0].values) {
          const d1 = new Date(ca).toISOString().slice(0, 10);
          editCounts[d1] = (editCounts[d1] ?? 0) + 1;
          if (ua && ua !== ca) {
            const d2 = new Date(ua).toISOString().slice(0, 10);
            editCounts[d2] = (editCounts[d2] ?? 0) + 1;
          }
        }
      }

      const tagRes = this.db.exec(
        "SELECT tags FROM notes WHERE is_deleted=0 AND tags!='' AND tags IS NOT NULL",
      );
      const tagCounts = {};
      if (tagRes[0]) {
        for (const [tagStr] of tagRes[0].values) {
          tagStr
            .split(",")
            .filter(Boolean)
            .forEach((t) => {
              tagCounts[t.trim()] = (tagCounts[t.trim()] ?? 0) + 1;
            });
        }
      }

      const groupRes = this.db.exec(`
        SELECT g.name, COUNT(n.id) as cnt
        FROM groups g
        LEFT JOIN collections c ON c.group_id = g.id
        LEFT JOIN modules m ON m.collection_id = c.id
        LEFT JOIN notes n ON n.module_id = m.id AND n.is_deleted=0
        GROUP BY g.id ORDER BY cnt DESC
      `);
      const notesByGroup =
        groupRes[0]?.values?.map((r) => ({ name: r[0], count: r[1] })) ?? [];

      const srsRes = this.db.exec(
        "SELECT srs_interval FROM notes WHERE is_deleted=0 AND srs_interval>0",
      );
      const srsIntervals = srsRes[0]?.values?.map((r) => r[0]) ?? [];

      return {
        notes,
        flashcards,
        dueToday,
        groups,
        favorites,
        editCounts,
        tagCounts,
        notesByGroup,
        srsIntervals,
      };
    } catch (e) {
      return null;
    }
  }

  getGraphDataFiltered(tagFilters, groupIds) {
    if (!this.db) return { nodes: [], links: [] };
    try {
      let notes = this._queryAll(
        "SELECT n.id, n.name, n.tags, n.module_id FROM notes n WHERE n.is_deleted=0",
      );
      if (tagFilters?.length > 0) {
        notes = notes.filter((n) =>
          tagFilters.some((t) => n.tags?.includes(t)),
        );
      }
      if (groupIds?.length > 0) {
        const noteIds = new Set();
        for (const gid of groupIds) {
          const res = this._queryAll(
            `SELECT n.id FROM notes n
             JOIN modules m ON n.module_id=m.id
             JOIN collections c ON m.collection_id=c.id
             WHERE c.group_id=? AND n.is_deleted=0`,
            [gid],
          );
          res.forEach((r) => noteIds.add(r.id));
        }
        notes = notes.filter((n) => noteIds.has(n.id));
      }
      return notes;
    } catch {
      return [];
    }
  }

  // ─── Collections / Modules / Groups ──────────────────────────────────────

  /**
   * @param {string} id @param {string} groupId @param {string} name @param {number} orderIndex
   */
  insertGroup(id, name, orderIndex) {
    this._assertDb();
    this.db.run("INSERT INTO groups (id, name, order_index) VALUES (?, ?, ?)", [
      id,
      name,
      orderIndex,
    ]);
  }

  updateItemNameAndMetadata(table, id, name, metadataStr) {
    this._assertDb();
    if (table === "notes") {
      this.db.run(`UPDATE notes SET name = ? WHERE id = ?`, [name, id]);
    } else {
      this.db.run(`UPDATE ${table} SET name = ?, metadata = ? WHERE id = ?`, [
        name,
        metadataStr,
        id,
      ]);
    }
  }

  insertCollection(id, groupId, name, orderIndex) {
    this._assertDb();
    this.db.run(
      "INSERT INTO collections (id, group_id, name, order_index) VALUES (?, ?, ?, ?)",
      [id, groupId, name, orderIndex],
    );
  }

  insertModule(id, collectionId, name, orderIndex) {
    this._assertDb();
    this.db.run(
      "INSERT INTO modules (id, collection_id, name, order_index) VALUES (?, ?, ?, ?)",
      [id, collectionId, name, orderIndex],
    );
  }

  deleteModule(moduleId, noteIds) {
    this._assertDb();
    for (const nid of noteIds) this.deleteNote(nid, false);
    this.db.run("DELETE FROM modules WHERE id=?", [moduleId]);
  }

  deleteCollection(collectionId, moduleIds, noteIdsByModule) {
    this._assertDb();
    for (const mid of moduleIds) {
      this.deleteModule(mid, noteIdsByModule[mid] ?? []);
    }
    this.db.run("DELETE FROM collections WHERE id=?", [collectionId]);
  }

  deleteGroup(groupId, collectionIds, moduleIdsByCollection, noteIdsByModule) {
    this._assertDb();
    for (const cid of collectionIds) {
      this.deleteCollection(
        cid,
        moduleIdsByCollection[cid] ?? [],
        noteIdsByModule,
      );
    }
    this.db.run("DELETE FROM groups WHERE id=?", [groupId]);
  }

  // ─── Images ──────────────────────────────────────────────────────────────

  insertImage(id, noteId, fileName, createdAt) {
    this._assertDb();
    this.db.run(
      "INSERT INTO images (id, note_id, file_name, created_at) VALUES (?, ?, ?, ?)",
      [id, noteId, fileName, createdAt],
    );
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  getActivityCounts() {
    this._assertDb();
    try {
      const res = this.db.exec(
        "SELECT created_at FROM notes WHERE is_deleted=0",
      );
      const counts = {};
      if (res[0]) {
        for (const [ts] of res[0].values) {
          const d = new Date(ts).toISOString().slice(0, 10);
          counts[d] = (counts[d] ?? 0) + 1;
        }
      }
      return counts;
    } catch {
      return {};
    }
  }

  getTotals() {
    this._assertDb();
    try {
      const notes =
        this.db.exec("SELECT COUNT(*) FROM notes WHERE is_deleted=0")?.[0]
          ?.values?.[0]?.[0] ?? 0;
      const books =
        this.db.exec(
          "SELECT COUNT(*) FROM collections c JOIN groups g ON c.group_id=g.id WHERE g.name LIKE '%Book%'",
        )?.[0]?.values?.[0]?.[0] ?? 0;
      const courses =
        this.db.exec(
          "SELECT COUNT(*) FROM collections c JOIN groups g ON c.group_id=g.id WHERE g.name LIKE '%Course%'",
        )?.[0]?.values?.[0]?.[0] ?? 0;
      const flashcards =
        this.db.exec(
          "SELECT COUNT(*) FROM notes WHERE is_deleted=0 AND flashcard_question != '' AND flashcard_question IS NOT NULL",
        )?.[0]?.values?.[0]?.[0] ?? 0;
      const dueReviews =
        this.db.exec(
          `SELECT COUNT(*) FROM notes WHERE is_deleted=0 AND flashcard_question != '' AND flashcard_question IS NOT NULL AND srs_next_review <= ?`,
          [Date.now()],
        )?.[0]?.values?.[0]?.[0] ?? 0;
      return {
        notes,
        books,
        courses,
        flashcards,
        dueReviews,
        completedReviews: 0,
      };
    } catch {
      return {
        notes: 0,
        books: 0,
        courses: 0,
        flashcards: 0,
        dueReviews: 0,
        completedReviews: 0,
      };
    }
  }

  /**
   * Searches notes by name (case-insensitive substring match).
   * @param {string} query
   * @param {number} [limit=10]
   * @returns {{ id: string, name: string }[]}
   */
  searchNotes(query, limit = 10) {
    if (!this.db) return [];
    try {
      return this._queryAll(
        "SELECT id, name, tags, module_id FROM notes WHERE is_deleted=0 AND name LIKE ? LIMIT ?",
        [`%${query}%`, limit],
      );
    } catch {
      return [];
    }
  }

  /**
   * Returns all non-deleted notes for the knowledge graph.
   * @returns {{ id: string, name: string }[]}
   */
  getAllNotesForGraph() {
    if (!this.db) return [];
    try {
      return this._queryAll(
        "SELECT id, name, tags, module_id FROM notes WHERE is_deleted=0",
      );
    } catch {
      return [];
    }
  }

  /**
   * Returns notes created at or after the given timestamp.
   * @param {number} sinceTs - Unix timestamp in ms
   * @returns {Object[]}
   */
  findNotesEditedSince(sinceTs) {
    if (!this.db) return [];
    try {
      return this._queryAll(
        "SELECT * FROM notes WHERE is_deleted=0 AND (created_at >= ? OR updated_at >= ?) ORDER BY MAX(created_at, COALESCE(updated_at, 0)) DESC",
        [sinceTs, sinceTs],
      );
    } catch {
      return [];
    }
  }

  /**
   * Returns the name of a group by ID, or null if not found.
   * @param {string} groupId
   * @returns {string|null}
   */
  getGroupName(groupId) {
    if (!this.db) return null;
    try {
      const res = this.db.exec("SELECT name FROM groups WHERE id=?", [groupId]);
      return res?.[0]?.values?.[0]?.[0] ?? null;
    } catch {
      return null;
    }
  }

  // ─── Logical Path ─────────────────────────────────────────────────────────

  /** Returns breadcrumb path for a note: Group / Collection / Module */
  getLogicalPath(noteId) {
    this._assertDb();
    try {
      const res = this.db.exec(
        `SELECT g.name, c.name, m.name, n.name
         FROM notes n
         JOIN modules m ON n.module_id = m.id
         JOIN collections c ON m.collection_id = c.id
         JOIN groups g ON c.group_id = g.id
         WHERE n.id = ?`,
        [noteId],
      );
      if (!res[0]?.values[0]) return null;
      const [g, c, m, n] = res[0].values[0];
      return { group: g, collection: c, module: m, note: n };
    } catch {
      return null;
    }
  }

  /**
   * Returns the filesystem path segments for a note relative to the vault root.
   * e.g. notes/<Group>/<Collection>/<Module>/<NoteName>.md
   * @param {string} noteId
   * @returns {string|null}  relative path from vault root (no leading slash)
   */
  getGroupFsPath(groupId) {
    try {
      const res = this.db.exec("SELECT name FROM groups WHERE id=?", [groupId]);
      if (!res[0]?.values[0]) return null;
      return `notes/${res[0].values[0][0].replace(/[/\\:*?"<>|]/g, "_")}`;
    } catch {
      return null;
    }
  }

  getCollectionFsPath(collectionId) {
    try {
      const res = this.db.exec(
        "SELECT g.name, c.name FROM collections c JOIN groups g ON c.group_id = g.id WHERE c.id = ?",
        [collectionId],
      );
      if (!res[0]?.values[0]) return null;
      const [g, c] = res[0].values[0];
      const sanitize = (s) => s.replace(/[/\\:*?"<>|]/g, "_");
      return `notes/${sanitize(g)}/${sanitize(c)}`;
    } catch {
      return null;
    }
  }

  getModuleFsPath(moduleId) {
    try {
      const res = this.db.exec(
        "SELECT g.name, c.name, m.name FROM modules m JOIN collections c ON m.collection_id = c.id JOIN groups g ON c.group_id = g.id WHERE m.id = ?",
        [moduleId],
      );
      if (!res[0]?.values[0]) return null;
      const [g, c, m] = res[0].values[0];
      const sanitize = (s) => s.replace(/[/\\:*?"<>|]/g, "_");
      return `notes/${sanitize(g)}/${sanitize(c)}/${sanitize(m)}`;
    } catch {
      return null;
    }
  }

  getNoteFsPath(noteId) {
    const lp = this.getLogicalPath(noteId);
    if (!lp) return null;
    const sanitize = (s) => s.replace(/[/\\:*?"<>|]/g, "_");
    return `notes/${sanitize(lp.group)}/${sanitize(lp.collection)}/${sanitize(lp.module)}/${sanitize(lp.note)}.md`;
  }

  // ─── Persistence ─────────────────────────────────────────────────────────

  /** Exports the database to a Uint8Array for writing to disk. */
  export() {
    this._assertDb();
    return this.db.export();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Runs a SELECT and returns all rows as plain objects.
   * @private
   * @param {string} sql
   * @param {Array} [params]
   * @returns {Object[]}
   */
  _queryAll(sql, params = []) {
    const res = this.db.exec(sql, params);
    if (!res[0]) return [];
    const { columns, values } = res[0];
    return values.map((row) =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]])),
    );
  }

  /** Max order_index for a given table/parent. */
  _nextOrder(table, parentCol, parentId) {
    const res = this.db.exec(
      `SELECT COALESCE(MAX(order_index), 0) FROM ${table} WHERE ${parentCol}=?`,
      [parentId],
    );
    return (res?.[0]?.values?.[0]?.[0] ?? 0) + 1;
  }
}

/** Singleton vault repository instance */
export const vaultRepository = new SqliteVaultRepository();
