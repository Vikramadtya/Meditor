const fs = require('fs');

function patchNode(file, isGroup) {
  let code = fs.readFileSync(file, 'utf8');

  // Add openConfirmDeleteModal to useStore destructuring
  code = code.replace(
    /openCreateVaultItemModal: s\.openCreateVaultItemModal,/,
    `openCreateVaultItemModal: s.openCreateVaultItemModal,
        openConfirmDeleteModal: s.openConfirmDeleteModal,`
  );

  code = code.replace(
    /const \{ activeVaultItem, setActiveVaultItem, openCreateVaultItemModal \} =/,
    `const { activeVaultItem, setActiveVaultItem, openCreateVaultItemModal, openConfirmDeleteModal } =`
  );

  // Replace delete onClick logic
  if (!isGroup) {
    code = code.replace(
      /onClick=\{async \(e\) => \{\s*e\.stopPropagation\(\);\s*\{\s*try \{\s*await vaultService\.deleteItem\([\s\S]*?\}\s*\}\s*\}\}/,
      `onClick={(e) => {
              e.stopPropagation();
              openConfirmDeleteModal(item);
            }}`
    );
  } else {
    code = code.replace(
      /onClick=\{async \(e\) => \{\s*e\.stopPropagation\(\);\s*\{\s*try \{\s*await vaultService\.deleteItem\([\s\S]*?\}\s*\}\s*\}\}/,
      `onClick={(e) => {
            e.stopPropagation();
            openConfirmDeleteModal(group);
          }}`
    );
  }

  fs.writeFileSync(file, code);
}

patchNode('src/domains/vault/presentation/components/vault/sidebar/VaultNode.jsx', false);
patchNode('src/domains/vault/presentation/components/vault/sidebar/VaultGroupNode.jsx', true);
