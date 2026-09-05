const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', 'utf8');

code = code.replace(
  'this.db.run("ALTER TABLE notes ADD COLUMN agenda_date INTEGER DEFAULT 0");',
  'this.db.run("ALTER TABLE notes ADD COLUMN agenda_date INTEGER DEFAULT 0");\n    } catch (e) {\n      // this._log.debug("Ignored exception:", e);\n    }\n    try {\n      this.db.run("ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0");'
);

fs.writeFileSync('src/domains/vault/infrastructure/SqliteVaultRepository.js', code);
