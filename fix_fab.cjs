const fs = require('fs');
let code = fs.readFileSync('src/components/layout/FloatingActionBar.jsx', 'utf8');

const search = `      <FabBtn
        onClick={() => setFlashcardModalOpen(true)}
        title="Active Recall Flashcard"
      >
        <Layers size={18} />
      </FabBtn>`;

code = code.replace(search, '');
code = code.replace('const { setFlashcardModalOpen, activeVaultItem } = useStore();', 'const { activeVaultItem } = useStore();');

fs.writeFileSync('src/components/layout/FloatingActionBar.jsx', code);
console.log('Fixed FAB');
