const fs = require('fs');
let code = fs.readFileSync('src/application/vault/VaultService.js', 'utf8');

const replaceStr = `  async loadVault(folderPath) {`;
const insertStr = `  async initVault(folderPath) {
    try {
      const SQL = await this._sqlPromise;
      const db = new SQL.Database();
      const exported = db.export();
      await fileSystem.writeBinaryFile(\`\${folderPath}/vault.db\`, exported);
      try {
        await window.Neutralino.filesystem.createDirectory(\`\${folderPath}/notes\`);
      } catch (e) {
        // directory might already exist
      }
      return true;
    } catch (e) {
      this._log.error("Failed to init vault", e);
      return false;
    }
  }

  async loadVault(folderPath) {`;

code = code.replace(replaceStr, insertStr);

fs.writeFileSync('src/application/vault/VaultService.js', code);
console.log('Added initVault');
