const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import toast')) {
    code = code.replace(
      'import React',
      'import toast from "react-hot-toast";\nimport React'
    );
  }
  
  // Replace delete logic
  code = code.replace(
    /if \(window\.confirm\(\`Delete "\$\{([a-z]+)\.name\}"\?\`\)\) \{\n\s*await vaultService\.deleteItem\([a-z]+\.type, [a-z]+\.id, [a-z]+\.path\);\n\s*reloadVaultHierarchy\(\);\n\s*\}/g,
    `if (window.confirm(\`Delete "\${\$1.name}"?\`)) {
                try {
                  await vaultService.deleteItem(\$1.type, \$1.id, \$1.path);
                  toast.success(\`Deleted "\${\$1.name}"\`);
                  reloadVaultHierarchy();
                } catch (err) {
                  toast.error("Failed to delete: " + err.message);
                }
              }`
  );
  fs.writeFileSync(file, code);
}

patch('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx');
patch('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx');
