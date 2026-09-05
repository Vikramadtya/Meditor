const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', 'utf8');

const regex = /_assertDb\(\) \{[\s\S]*?if \(!this\.db\) throw new Error\("Database not initialized"\);\n  \}/;
const newDbCheck = `_assertDb() {
    if (!this.db) throw new Error("Database not initialized");
  }

  _migrate() {
    if (!this.db) return;
    const columns = [
      "agenda_date INTEGER DEFAULT 0",
      "is_deleted INTEGER DEFAULT 0",
      "tags TEXT DEFAULT ''",
      "is_favorite INTEGER DEFAULT 0",
      "flashcard_question TEXT DEFAULT ''",
      "flashcard_answer TEXT DEFAULT ''",
      "srs_ease REAL DEFAULT 2.5",
      "srs_interval INTEGER DEFAULT 0",
      "srs_next_review INTEGER DEFAULT 0",
      "created_at INTEGER",
      "updated_at INTEGER"
    ];
    for (const col of columns) {
      try {
        this.db.run(\`ALTER TABLE notes ADD COLUMN \${col}\`);
      } catch (e) {}
    }
  }`;

code = code.replace(regex, newDbCheck);
code = code.replace('this._assertDb();', 'this._assertDb();\n    this._migrate();');

fs.writeFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', code);
