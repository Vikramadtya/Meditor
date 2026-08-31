const fs = require('fs');
let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
const lines = app.split('\n');
const seen = new Set();
const out = [];

for (const line of lines) {
  if (line.startsWith('import ') && line.includes('AgendaPage')) {
    if (seen.has('AgendaPage')) continue;
    seen.add('AgendaPage');
  }
  out.push(line);
}
fs.writeFileSync('src/apps/VaultApp.jsx', out.join('\n'));
