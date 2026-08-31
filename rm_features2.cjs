const fs = require('fs');

let sidebar = fs.readFileSync('src/components/vault/VaultSidebar.jsx', 'utf8');
const flashcardLink = `          <SidebarLink
            icon={<BrainCircuit size={14} />}
            label="Flashcard Review"
            isActive={activeVaultItem?.type === "flashcards"}
            onClick={() =>
              setActiveVaultItem({
                type: "flashcards",
                id: "flashcards",
                name: "Flashcard Review",
              })
            }
          />`;
const graphLink = `          <SidebarLink
            icon={<Network size={14} />}
            label="Knowledge Graph"
            isActive={activeVaultItem?.type === "graph"}
            onClick={() =>
              setActiveVaultItem({
                type: "graph",
                id: "graph",
                name: "Knowledge Graph",
              })
            }
          />`;
sidebar = sidebar.replace(flashcardLink, '');
sidebar = sidebar.replace(graphLink, '');
fs.writeFileSync('src/components/vault/VaultSidebar.jsx', sidebar);

let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace('import FlashcardReviewPage from "../components/vault/FlashcardReviewPage";\n', '');
app = app.replace('import KnowledgeGraphPage from "../components/vault/KnowledgeGraphPage";\n', '');
app = app.replace('  flashcards: FlashcardReviewPage,\n', '');
app = app.replace('  graph: KnowledgeGraphPage,\n', '');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

console.log('Cleaned up Flashcard and Graph again');
