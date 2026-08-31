const fs = require('fs');
let code = fs.readFileSync('src/components/modals/ModalManager.jsx', 'utf8');

code = code.replace('import GraphModal from "./GraphModal";\\n', '');
code = code.replace('import FlashcardModal from "./FlashcardModal";\\n', '');
code = code.replace('      <GraphModal />\\n', '');
code = code.replace('      <FlashcardModal />\\n', '');

fs.writeFileSync('src/components/modals/ModalManager.jsx', code);

// Delete the files
if (fs.existsSync('src/components/modals/GraphModal.jsx')) fs.unlinkSync('src/components/modals/GraphModal.jsx');
if (fs.existsSync('src/components/modals/FlashcardModal.jsx')) fs.unlinkSync('src/components/modals/FlashcardModal.jsx');
if (fs.existsSync('src/components/vault/FlashcardReviewPage.jsx')) fs.unlinkSync('src/components/vault/FlashcardReviewPage.jsx');
if (fs.existsSync('src/components/vault/KnowledgeGraphPage.jsx')) fs.unlinkSync('src/components/vault/KnowledgeGraphPage.jsx');
if (fs.existsSync('src/domain/srs.js')) fs.unlinkSync('src/domain/srs.js');
if (fs.existsSync('src/application/vault/srsService.js')) fs.unlinkSync('src/application/vault/srsService.js');

console.log('Removed modal files');
