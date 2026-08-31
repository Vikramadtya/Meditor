const fs = require('fs');

let code = fs.readFileSync('src/hooks/useMarkdown.js', 'utf8');

if (!code.includes('import { Logger } from')) {
  code = code.replace(
    'import { useStore } from "../store/index";', 
    'import { useStore } from "../store/index";\nimport { Logger } from "../infrastructure/Logger";'
  );
  code = code.replace(/logger\.warn/g, 'Logger.warn');
  code = code.replace(/logger\.error/g, 'Logger.error');
}

fs.writeFileSync('src/hooks/useMarkdown.js', code);
console.log('Fixed Logger in useMarkdown.js');
