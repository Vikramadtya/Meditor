const fs = require('fs');
let code = fs.readFileSync('src/hooks/useMarkdown.js', 'utf8');

code = code.replace(
  'import { Logger } from "../infrastructure/Logger";',
  'import { Logger } from "../infrastructure/Logger";\nconst log = Logger.forContext("useMarkdown");'
);
code = code.replace(/Logger\.warn/g, 'log.warn');
code = code.replace(/Logger\.error/g, 'log.error');

fs.writeFileSync('src/hooks/useMarkdown.js', code);
console.log('Fixed Logger instantiation');
