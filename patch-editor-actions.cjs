const fs = require('fs');
let code = fs.readFileSync('src/domains/editor/store/editorActions.js', 'utf8');
code = code.replace(/fullPath\.split\(\/\[\/\[\\s\\S\]\]\/\)/g, 'fullPath.split(/[\\\\/]/)');
fs.writeFileSync('src/domains/editor/store/editorActions.js', code);
