const fs = require('fs');
let code = fs.readFileSync('src/infrastructure/SqliteVaultRepository.js', 'utf8');

const schemaSearch = `  init() {
    this._assertDb();
    this.db.run(\`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER,
        name TEXT NOT NULL,
        created_at INTEGER,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER,
        name TEXT NOT NULL,
        created_at INTEGER,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER,
        name TEXT NOT NULL,
        content TEXT,
        tags TEXT DEFAULT "",
        is_favorite INTEGER DEFAULT 0,
        flashcard_question TEXT DEFAULT "",
        flashcard_answer TEXT DEFAULT "",
        srs_ease REAL DEFAULT 2.5,
        srs_interval INTEGER DEFAULT 0,
        srs_next_review INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      );
    \`);
  }`;

const schemaReplace = `  init() {
    this._assertDb();
    this.db.run(\`
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
    \`);
  }`;

code = code.replace(schemaSearch, schemaReplace);
fs.writeFileSync('src/infrastructure/SqliteVaultRepository.js', code);
console.log('Updated schema in SqliteVaultRepository');
