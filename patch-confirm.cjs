const fs = require('fs');

const fixConfirm = (file) => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /if \(window\.confirm\(\`Delete "\$\{item\.name\}"\?\`\)\) \{/,
    `let res = await window.Neutralino.os.showMessageBox('Confirm Delete', \`Are you sure you want to delete "\${item.name}"?\`, 'YES_NO', 'WARNING');
              if (res === 'YES') {`
  );
  code = code.replace(
    /if \(window\.confirm\(\`Are you sure you want to delete "\$\{group\.name\}"\?\`\)\) \{/,
    `let res = await window.Neutralino.os.showMessageBox('Confirm Delete', \`Are you sure you want to delete "\${group.name}"?\`, 'YES_NO', 'WARNING');
              if (res === 'YES') {`
  );
  fs.writeFileSync(file, code);
};

fixConfirm('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx');
fixConfirm('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx');
