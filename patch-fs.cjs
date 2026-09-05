const fs = require('fs');
let code = fs.readFileSync('src/domains/workspace/infrastructure/NeutralinoFileSystem.js', 'utf8');

code = code.replace(
  /this\._log\.warn\("Failed to remove file: " \+ filePath, err\);\n\s*\}/,
  'this._log.warn("Failed to remove file: " + filePath, err);\n      throw err;\n    }'
);

code = code.replace(
  /this\._log\.warn\("Failed to remove directory: " \+ dirPath, err\);\n\s*\}/,
  'this._log.warn("Failed to remove directory: " + dirPath, err);\n      throw err;\n    }'
);

fs.writeFileSync('src/domains/workspace/infrastructure/NeutralinoFileSystem.js', code);
