const fs = require('fs');
let file = fs.readFileSync('src/hooks/useMarkdown.js', 'utf8');

if (!file.includes('markdownItMark')) {
  file = file.replace(
    'import markdownItMkDocsTabs from "../utils/markdown-it-mkdocs-tabs";',
    'import markdownItMkDocsTabs from "../utils/markdown-it-mkdocs-tabs";\nimport markdownItMark from "markdown-it-mark";'
  );
  
  file = file.replace(
    '  parser.use(markdownItMkDocsTabs);',
    '  parser.use(markdownItMkDocsTabs);\n  parser.use(markdownItMark);'
  );
  
  fs.writeFileSync('src/hooks/useMarkdown.js', file);
}
