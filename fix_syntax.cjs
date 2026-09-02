const fs = require('fs');
let file = fs.readFileSync('src/components/modals/CreateVaultItemModal.jsx', 'utf8');

file = file.replace(
  '<div\n            <label',
  '<div style={{ marginBottom: "20px" }}>\n            <label'
);

fs.writeFileSync('src/components/modals/CreateVaultItemModal.jsx', file);
