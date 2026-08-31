const fs = require('fs');

let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace('import AgendaPage from "../components/vault/AgendaPage";\\nimport AgendaPage', 'import AgendaPage');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

let repo = fs.readFileSync('src/infrastructure/SqliteVaultRepository.js', 'utf8');
const searchMethods = `  // ─── Agenda ─────────────────────────────────────────────────────────────

  getAgendaDays() {`;
// Let's check what precedes it.
const lines = repo.split('\\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('getAgendaDays() {')) {
    console.log('Before getAgendaDays: ' + lines[i-1]);
    console.log('Before that: ' + lines[i-2]);
  }
}
