const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx', 'utf8');

code = code.replace(
  /onClick=\{async \(e\) => \{\n\s*e\.stopPropagation\(\);\n\s*if \(\n\s*window\.confirm\(\`Are you sure you want to delete "\$\{group\.name\}"\?\`\)\n\s*\) \{\n\s*await vaultService\.deleteItem\("container", group\.id, group\.path\);\n\s*reloadVaultHierarchy\(\);\n\s*\}\n\s*\}\}/,
  `onClick={async (e) => {
            e.stopPropagation();
            if (window.confirm(\`Are you sure you want to delete "\${group.name}"?\`)) {
              try {
                await vaultService.deleteItem("container", group.id, group.path);
                toast.success(\`Deleted "\${group.name}"\`);
                reloadVaultHierarchy();
              } catch (err) {
                toast.error("Delete failed: " + err.message);
                console.error("Delete failed", err);
              }
            }
          }}`
);
// Import toast
if (!code.includes('import toast')) {
  code = code.replace('import React', 'import toast from "react-hot-toast";\nimport React');
}

fs.writeFileSync('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx', code);
