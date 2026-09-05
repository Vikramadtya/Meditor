const fs = require('fs');
let code = fs.readFileSync('src/domains/workspace/infrastructure/NeutralinoFileSystem.js', 'utf8');

code = code.replace(/window\.Neutralino\.filesystem\.removeFile/g, 'window.Neutralino.filesystem.remove');
code = code.replace(/window\.Neutralino\.filesystem\.removeDirectory/g, 'window.Neutralino.filesystem.remove');

fs.writeFileSync('src/domains/workspace/infrastructure/NeutralinoFileSystem.js', code);
