const fs = require('fs');
let app = fs.readFileSync('src/apps/VaultApp.jsx', 'utf8');
app = app.replace(/import AgendaPage.*\n/, '');
fs.writeFileSync('src/apps/VaultApp.jsx', app);

let manager = fs.readFileSync('src/components/modals/ModalManager.jsx', 'utf8');
manager = manager.replace(/import GraphModal.*\n/, '');
manager = manager.replace(/import FlashcardModal.*\n/, '');
fs.writeFileSync('src/components/modals/ModalManager.jsx', manager);

console.log('Fixed imports');
