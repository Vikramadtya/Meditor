const fs = require('fs');
let code = fs.readFileSync('src/core/ui/ModalManager.jsx', 'utf8');

const imports = `import ConfirmDeleteModal from "../../domains/vault/presentation/components/ConfirmDeleteModal";
import AuditModal from "../../domains/vault/presentation/components/AuditModal";
import MoveItemModal from "../../domains/vault/presentation/components/MoveItemModal";
import VaultContextMenu from "../../domains/vault/presentation/components/vault/sidebar/VaultContextMenu";`;

code = code.replace(/import ConfirmDeleteModal[^\n]*/, imports);

const components = `<ConfirmDeleteModal />
      <AuditModal />
      <MoveItemModal />
      <VaultContextMenu />`;

code = code.replace(/<ConfirmDeleteModal \/>/, components);

fs.writeFileSync('src/core/ui/ModalManager.jsx', code);
