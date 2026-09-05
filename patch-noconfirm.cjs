const fs = require('fs');

function removeConfirm(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /let res = await window\.Neutralino\.os\.showMessageBox[\s\S]*?if \(res === 'YES'\) \{/,
    `{`
  );
  fs.writeFileSync(file, code);
}

removeConfirm('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx');
removeConfirm('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx');
