const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/CreateVaultItemModal.jsx', 'utf8');

// Import Logger and openNoteFromVault
code = code.replace(
  'import { reloadVaultHierarchy } from "../../store/vaultActions";',
  'import { reloadVaultHierarchy, openNoteFromVault } from "../../store/vaultActions";\nimport { Logger } from "../../../../core/infrastructure/Logger";\n\nconst log = Logger.forContext("CreateVaultItemModal");'
);

// Fix openNoteFromVault usage
code = code.replace(
  'useStore.getState().openNoteFromVault(n);',
  'await openNoteFromVault(n);'
);

// Fix setActiveVaultItem
code = code.replace(
  'setActiveVaultItem(c);',
  'useStore.getState().setActiveVaultItem(c);'
);

fs.writeFileSync('src/domains/vault/presentation/components/CreateVaultItemModal.jsx', code);
