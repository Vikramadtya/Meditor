const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/application/VaultQueryUseCase.js', 'utf8');
code = code.replace(
  '        results.push({\n          id: cached ? cached.id : childRelPath,\n          name,\n          type: "note",\n          path: childRelPath,\n        });',
  '        if (!cached || cached.is_deleted !== 1) {\n          results.push({\n            id: cached ? cached.id : childRelPath,\n            name,\n            type: "note",\n            path: childRelPath,\n          });\n        }'
);
fs.writeFileSync('src/domains/vault/application/VaultQueryUseCase.js', code);
