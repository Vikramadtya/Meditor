const fs = require('fs');
let file = fs.readFileSync('src/components/vault/sidebar/VaultNode.jsx', 'utf8');

file = file.replace(
  'openCreateVaultItemModal("container", item.path);',
  'openCreateVaultItemModal("auto", item.path);'
);

fs.writeFileSync('src/components/vault/sidebar/VaultNode.jsx', file);
