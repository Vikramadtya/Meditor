const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/presentation/components/CreateVaultItemModal.jsx', 'utf8');

code = code.replace(
  'import { vaultService } from "../../application/VaultService";',
  'import { vaultService } from "../../application/VaultService";\nimport { openNoteFromVault } from "../../store/vaultActions";\nimport { Logger } from "../../../../core/infrastructure/Logger";\n\nconst log = Logger.forContext("CreateVaultItemModal");'
);

code = code.replace(
  'useStore.getState().openNoteFromVault(n);',
  'await openNoteFromVault(n);'
);

// We don't need to replace setActiveVaultItem because it's extracted from useStore using useShallow
code = code.replace(
  'useStore.getState().setActiveVaultItem(c);',
  'setActiveVaultItem(c);'
);

fs.writeFileSync('src/domains/vault/presentation/components/CreateVaultItemModal.jsx', code);
