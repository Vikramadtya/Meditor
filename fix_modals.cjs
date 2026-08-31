const fs = require('fs');

let code = fs.readFileSync('src/components/modals/ModalManager.jsx', 'utf8');

code = code.replace(/<GraphModal \/>\n?\s*/g, '');
code = code.replace(/<FlashcardModal \/>\n?\s*/g, '');

fs.writeFileSync('src/components/modals/ModalManager.jsx', code);
