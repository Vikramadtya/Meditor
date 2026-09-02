const fs = require('fs');

let file = fs.readFileSync('src/application/vault/VaultService.js', 'utf8');

file = file.replace(
  '      await this.saveVault();\n    }\n  }',
  '      await this.saveVault();\n      const parentRelPath = relPath.substring(0, relPath.lastIndexOf("/"));\n      this.notify(parentRelPath);\n    }\n  }'
);

fs.writeFileSync('src/application/vault/VaultService.js', file);
