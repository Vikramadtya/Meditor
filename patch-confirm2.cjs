const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx', 'utf8');
code = code.replace(
  /if \(\s*window\.confirm\(\`Are you sure you want to delete "\$\{group\.name\}"\?\`\)\s*\) \{/,
  `let res = await window.Neutralino.os.showMessageBox('Confirm Delete', \`Are you sure you want to delete "\${group.name}"?\`, 'YES_NO', 'WARNING');
            if (res === 'YES') {`
);
fs.writeFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx', code);
