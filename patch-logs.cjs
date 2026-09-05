const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/application/VaultService.js', 'utf8');

code = code.replace(
  /async deleteItem\(type, id, relPath, hard = false\) \{/,
  `async deleteItem(type, id, relPath, hard = false) {
    this._log.info(\`Deleting \${type} "\${relPath}" (hard: \${hard})\`);`
);

code = code.replace(
  /async renameItem\(type, id, oldRelPath, newName\) \{/,
  `async renameItem(type, id, oldRelPath, newName) {
    this._log.info(\`Renaming \${type} "\${oldRelPath}" to "\${newName}"\`);`
);

fs.writeFileSync('src/domains/vault/application/VaultService.js', code);
