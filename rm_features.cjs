const fs = require('fs');

// 1. VaultSidebar.jsx
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

// 2. VaultApp.jsx
let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace('import FlashcardReviewPage from "../components/vault/FlashcardReviewPage";\n', '');
app = app.replace('import KnowledgeGraphPage from "../components/vault/KnowledgeGraphPage";\n', '');
app = app.replace('  flashcards: FlashcardReviewPage,\n', '');
app = app.replace('  graph: KnowledgeGraphPage,\n', '');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

// 3. NoteMetaModal.jsx
if (fs.existsSync('src/components/modals/NoteMetaModal.jsx')) {
  let modal = fs.readFileSync('src/components/modals/NoteMetaModal.jsx', 'utf8');
  // I will just replace the flashcard section with empty if possible, or rewrite it safely.
  // Actually, I can just use a regex to strip the flashcard section
  const flashcardStart = `{/* ACTIVE RECALL FLASHCARD SECTION */}`;
  if (modal.includes(flashcardStart)) {
    const lines = modal.split('\\n');
    let out = [];
    let skipping = false;
    for (let l of lines) {
      if (l.includes(flashcardStart)) {
        skipping = true;
      }
      if (skipping && l.includes(`{/* END FLASHCARD SECTION */}`)) {
        skipping = false;
        continue;
      }
      if (!skipping) out.push(l);
    }
    fs.writeFileSync('src/components/modals/NoteMetaModal.jsx', out.join('\\n'));
  }
}
console.log('Removed features');
