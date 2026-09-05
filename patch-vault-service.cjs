const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/application/VaultService.js', 'utf8');

code = code.replace(
  'createNoteCommand,\n  deleteItemCommand,\n} from "./VaultMutationUseCase";',
  'createNoteCommand,\n  deleteItemCommand,\n  renameItemCommand,\n} from "./VaultMutationUseCase";'
);

const renameMethod = `
  async renameItem(type, id, oldRelPath, newName) {
    if (!this.db) return;
    await renameItemCommand(this.vaultPath, type, id, oldRelPath, newName);
    await this.saveVault();
    // Re-sync vault to fix paths for nested notes if a directory was renamed
    if (type === "container") {
      await this.syncVault();
    }
    
    // Notify old parent to refresh
    if (oldRelPath) {
      const parentRelPath = oldRelPath.substring(0, oldRelPath.lastIndexOf("/"));
      this.notify(parentRelPath);
    }
  }
`;

code = code.replace(
  'async deleteItem(type, id, relPath, hard = false) {',
  renameMethod + '\n\n  async deleteItem(type, id, relPath, hard = false) {'
);

fs.writeFileSync('src/domains/vault/application/VaultService.js', code);
