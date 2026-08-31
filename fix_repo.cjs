const fs = require('fs');
let repo = fs.readFileSync('src/infrastructure/SqliteVaultRepository.js', 'utf8');

const classEnd = `\n}\n\nexport const vaultRepository`;
const agendaMethods = `
  // ─── Agenda ─────────────────────────────────────────────────────────────

  getAgendaDays() {
    this._assertDb();
    try {
      const res = this.db.exec("SELECT DISTINCT agenda_date FROM notes WHERE is_deleted=0 AND agenda_date > 0");
      if (!res[0]) return [];
      return res[0].values.map(v => v[0]);
    } catch { return []; }
  }

  getNotesForDate(startTs, endTs) {
    this._assertDb();
    return this._queryAll("SELECT * FROM notes WHERE is_deleted=0 AND agenda_date >= ? AND agenda_date <= ?", [startTs, endTs]);
  }

  setNoteAgendaDate(noteId, dateTs) {
    this._assertDb();
    this.db.run("UPDATE notes SET agenda_date = ? WHERE id = ?", [dateTs, noteId]);
  }

  getAgendaNotes() {
    const now = Date.now();
    return this._queryAll(
      "SELECT * FROM notes WHERE is_deleted=0 AND agenda_date > 0 AND agenda_date <= ? ORDER BY agenda_date ASC",
      [now]
    );
  }
`;

repo = repo.replace(classEnd, agendaMethods + classEnd);

// Also add the ALTER TABLE
const assertDb = `  _assertDb() {`;
const alterDb = `  _assertDb() {
    try {
      this.db.run("ALTER TABLE notes ADD COLUMN agenda_date INTEGER DEFAULT 0");
    } catch(e) {}
`;
repo = repo.replace(assertDb, alterDb);

fs.writeFileSync('src/infrastructure/SqliteVaultRepository.js', repo);

let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace('import AgendaPage from "../components/vault/AgendaPage";\\nimport AgendaPage', 'import AgendaPage');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

console.log('Fixed repo injection');
