const fs = require('fs');
let code = fs.readFileSync('src/core/ui/ModalManager.jsx', 'utf8');

code = code.replace(
  /import TagModal from "\.\.\/\.\.\/domains\/vault\/presentation\/components\/TagModal";/,
  `import TagModal from "../../domains/vault/presentation/components/TagModal";
import ConfirmDeleteModal from "../../domains/vault/presentation/components/ConfirmDeleteModal";`
);

code = code.replace(
  /<TagModal \/>/,
  `<TagModal />
      <ConfirmDeleteModal />`
);

fs.writeFileSync('src/core/ui/ModalManager.jsx', code);
