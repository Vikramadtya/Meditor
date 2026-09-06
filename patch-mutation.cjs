const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/application/VaultMutationUseCase.js', 'utf8');
code = code.replace(/window\.Neutralino\.filesystem\.removeDirectory/g, 'fileSystem.removeDirectory');
fs.writeFileSync('src/domains/vault/application/VaultMutationUseCase.js', code);
