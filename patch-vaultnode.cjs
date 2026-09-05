const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx', 'utf8');

code = code.replace(
  /onClick=\{async \(e\) => \{\n\s*e\.stopPropagation\(\);\n\s*if \(window\.confirm\(\`Delete "\$\{item\.name\}"\?\`\)\) \{\n\s*await vaultService\.deleteItem\(item\.type, item\.id, item\.path\);\n\s*reloadVaultHierarchy\(\); \/\/ Actually this triggers a top-level reload, but that won't reload this node's parent automatically if the parent isn't at the root\. We might need a better refresh mechanism\.\n\s*\}\n\s*\}\}/,
  `onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm(\`Delete "\${item.name}"?\`)) {
                try {
                  await vaultService.deleteItem(item.type, item.id, item.path, true); // Hard delete to actually remove files
                  toast.success(\`Deleted "\${item.name}"\`);
                  reloadVaultHierarchy();
                } catch (err) {
                  toast.error("Delete failed: " + err.message);
                  console.error("Delete failed", err);
                }
              }
            }}`
);
fs.writeFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx', code);
