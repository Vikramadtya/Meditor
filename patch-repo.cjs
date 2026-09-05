const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', 'utf8');

code = code.replace(
  'getNoteById(id) {',
  'findAllNotes() {\n    return this._queryAll("SELECT * FROM notes WHERE is_deleted=0");\n  }\n\n  getNoteById(id) {'
);

fs.writeFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', code);
