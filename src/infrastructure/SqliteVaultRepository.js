export class SqliteVaultRepository {
  constructor() {
    this.db = null;
  }

  attach(dbInstance) {
    this.db = dbInstance;
    this.init();
  }

  _assertDb() {
    if (!this.db) throw new Error("Database not initialized");
  }

  init() {
    this._assertDb();
    this.db.run(`
      CREATE TABLE IF NOT EXISTS containers (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        name TEXT,
        metadata TEXT
      );
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        tags TEXT DEFAULT "",
        is_favorite INTEGER DEFAULT 0,
        flashcard_question TEXT DEFAULT "",
        flashcard_answer TEXT DEFAULT "",
        srs_ease REAL DEFAULT 2.5,
        srs_interval INTEGER DEFAULT 0,
        srs_next_review INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER,
        is_deleted INTEGER DEFAULT 0
      );
    `);
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  _queryAll(sql, params = []) {
    this._assertDb();
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  _run(sql, params = []) {
    this._assertDb();
    this.db.run(sql, params);
  }

  // Note Ops
  upsertNote(note) {
    const existing = this._queryAll("SELECT id FROM notes WHERE id=?", [
      note.id,
    ]);
    if (existing.length > 0) {
      this._run(
        `UPDATE notes SET path=?, name=?, tags=?, is_favorite=?, flashcard_question=?, flashcard_answer=?, srs_ease=?, srs_interval=?, srs_next_review=?, updated_at=?, is_deleted=? WHERE id=?`,
        [
          note.path,
          note.name,
          note.tags || "",
          note.is_favorite || 0,
          note.flashcard_question || "",
          note.flashcard_answer || "",
          note.srs_ease || 2.5,
          note.srs_interval || 0,
          note.srs_next_review || 0,
          note.updated_at || Date.now(),
          note.is_deleted || 0,
          note.id,
        ],
      );
    } else {
      this._run(
        `INSERT INTO notes (id, path, name, tags, is_favorite, flashcard_question, flashcard_answer, srs_ease, srs_interval, srs_next_review, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.path,
          note.name,
          note.tags || "",
          note.is_favorite || 0,
          note.flashcard_question || "",
          note.flashcard_answer || "",
          note.srs_ease || 2.5,
          note.srs_interval || 0,
          note.srs_next_review || 0,
          note.created_at || Date.now(),
          note.updated_at || Date.now(),
          note.is_deleted || 0,
        ],
      );
    }
  }

  getNoteByPath(path) {
    return (
      this._queryAll("SELECT * FROM notes WHERE path=?", [path])[0] || null
    );
  }

  getNoteById(id) {
    return this._queryAll("SELECT * FROM notes WHERE id=?", [id])[0] || null;
  }

  deleteNoteById(id) {
    this._run("DELETE FROM notes WHERE id=?", [id]);
  }

  // Container Ops
  upsertContainer(container) {
    const existing = this._queryAll("SELECT id FROM containers WHERE id=?", [
      container.id,
    ]);
    if (existing.length > 0) {
      this._run("UPDATE containers SET path=?, name=?, metadata=? WHERE id=?", [
        container.path,
        container.name,
        JSON.stringify(container.metadata || {}),
        container.id,
      ]);
    } else {
      this._run(
        "INSERT INTO containers (id, path, name, metadata) VALUES (?, ?, ?, ?)",
        [
          container.id,
          container.path,
          container.name,
          JSON.stringify(container.metadata || {}),
        ],
      );
    }
  }

  getContainerByPath(path) {
    const row = this._queryAll("SELECT * FROM containers WHERE path=?", [
      path,
    ])[0];
    if (row) row.metadata = JSON.parse(row.metadata || "{}");
    return row || null;
  }

  deleteContainerById(id) {
    this._run("DELETE FROM containers WHERE id=?", [id]);
  }

  export() {
    this._assertDb();
    return this.db.export();
  }

  // Dashboard queries
  getAgendaNotes() {
    const now = Date.now();
    return this._queryAll(
      "SELECT * FROM notes WHERE is_deleted=0 AND (flashcard_question != '' OR tags LIKE '%#srs%') AND srs_next_review <= ? ORDER BY srs_next_review ASC",
      [now],
    );
  }

  findNotesEditedSince(timestamp) {
    return this._queryAll(
      "SELECT * FROM notes WHERE is_deleted=0 AND updated_at >= ? ORDER BY updated_at DESC",
      [timestamp],
    );
  }

  getAllTags() {
    const rows = this._queryAll(
      "SELECT tags FROM notes WHERE is_deleted=0 AND tags != ''",
    );
    const tagCounts = {};
    for (const row of rows) {
      if (!row.tags) continue;
      const tags = row.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      for (const t of tags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const vaultRepository = new SqliteVaultRepository();
