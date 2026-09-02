const fs = require('fs');
let file = fs.readFileSync('src/store/actions/editorActions.js', 'utf8');

file = file.replace(/const match = text\.match\(\/\^---\n\[\\s\\S\]\*\?\\n---\\n\/\);/, 'const match = text.match(/^---\\n[\\\\s\\\\S]*?\\n---\\n/);');

fs.writeFileSync('src/store/actions/editorActions.js', file);
