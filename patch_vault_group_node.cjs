const fs = require('fs');
let file = fs.readFileSync('src/components/vault/sidebar/VaultGroupNode.jsx', 'utf8');

file = file.replace(
  'openCreateVaultItemModal("container", group.path);',
  'openCreateVaultItemModal("auto", group.path);'
);

fs.writeFileSync('src/components/vault/sidebar/VaultGroupNode.jsx', file);
