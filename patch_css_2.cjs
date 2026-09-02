const fs = require('fs');
let file = fs.readFileSync('src/styles/Modals.css', 'utf8');

file = file.replace(
  '.settings-modal {\n  width: 900px;',
  '.settings-modal {\n  width: 900px;\n  max-width: 90vw;'
);

fs.writeFileSync('src/styles/Modals.css', file);
