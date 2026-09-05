const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/application/VaultService.js', 'utf8');

code = code.replace(/renameItemCommand,/, 'renameItemCommand, moveItemCommand,');

const moveCode = `
  async moveItem(type, id, oldRelPath, newParentRelPath) {
    this._log.info(\`Moving \${type} \${oldRelPath} to \${newParentRelPath}\`);
    await moveItemCommand(this.vaultPath, type, id, oldRelPath, newParentRelPath);
    await this.saveVault();
    // Re-sync vault because moving a folder changes paths of all its children
    if (type === 'container') {
      await this.syncVault();
    }
    const oldParent = oldRelPath.substring(0, oldRelPath.lastIndexOf("/"));
    this.notify(oldParent);
    this.notify(newParentRelPath);
  }
`;

code = code.replace(/getNotePath\(noteId\) \{/, moveCode + '\n  getNotePath(noteId) {');

fs.writeFileSync('src/domains/vault/application/VaultService.js', code);
