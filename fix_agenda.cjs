const fs = require('fs');

// 1. Add methods to SqliteVaultRepository
let repo = fs.readFileSync('src/infrastructure/SqliteVaultRepository.js', 'utf8');

const initSql = `      CREATE TABLE IF NOT EXISTS notes (`;
const altSql = `      CREATE TABLE IF NOT EXISTS notes (\n`;
repo = repo.replace(initSql, altSql);

// We'll just run ALTER TABLE silently in init
const assertDb = `  _assertDb() {`;
const alterDb = `  _assertDb() {
    try {
      this.db.run("ALTER TABLE notes ADD COLUMN agenda_date INTEGER DEFAULT 0");
    } catch(e) {}
`;
repo = repo.replace(assertDb, alterDb);

const helperIndex = repo.indexOf('// ─── Helpers');
const agendaMethods = `  // ─── Agenda ─────────────────────────────────────────────────────────────

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
repo = repo.slice(0, helperIndex) + agendaMethods + repo.slice(helperIndex);
fs.writeFileSync('src/infrastructure/SqliteVaultRepository.js', repo);

// 2. Add AgendaPage back to App
let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace('import GlobalDashboard', 'import AgendaPage from "../components/vault/AgendaPage";\nimport GlobalDashboard');
app = app.replace('const PAGE_MAP = {', 'const PAGE_MAP = {\n  agenda: AgendaPage,');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

// 3. Add AgendaLink to Sidebar
let sidebar = fs.readFileSync('src/components/vault/VaultSidebar.jsx', 'utf8');
const searchLink = `        <SidebarLink
          icon={<Star size={14} />}`;
const insertLink = `        <SidebarLink
          icon={<CalendarDays size={14} />}
          label="Agenda"
          isActive={activeVaultItem?.type === "agenda"}
          onClick={() =>
            setActiveVaultItem({ type: "agenda", id: "agenda", name: "Agenda" })
          }
        />\n` + searchLink;
sidebar = sidebar.replace(searchLink, insertLink);
fs.writeFileSync('src/components/vault/VaultSidebar.jsx', sidebar);

// 4. Update GlobalDashboard to show Agenda (we'll just append it to the flex row)
let gd = fs.readFileSync('src/components/vault/GlobalDashboard.jsx', 'utf8');
const searchGd = `      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>`;
const replaceGd = `  const [agendaNotes, setAgendaNotes] = React.useState([]);
  React.useEffect(() => {
    const fetchAgenda = async () => {
      const { vaultRepository } = await import("../../infrastructure/SqliteVaultRepository");
      setAgendaNotes(vaultRepository.getAgendaNotes());
    };
    fetchAgenda();
  }, [vaultHierarchy]);

  <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>`;
// Wait, we can't just drop hooks anywhere. We'll reconstruct GlobalDashboard completely since we're updating ContainerDashboard anyway.
console.log('Fixed agenda partially');
