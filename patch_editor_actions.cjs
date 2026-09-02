const fs = require('fs');

let file = fs.readFileSync('src/store/actions/editorActions.js', 'utf8');

file = file.replace(
  'const match = text.match(/^---\\n[\\\\s\\\\S]*?\\n---\\n/);',
  'const match = text.match(/^---\\n[\\s\\S]*?\\n---\\n/);'
);

// wait, if it was written with double backslashes, maybe it was a typo in the original file. Let's just do a regex replace to be safe.
file = file.replace(/\[\\\\s\\\\S\]/g, '[\\s\\S]');

fs.writeFileSync('src/store/actions/editorActions.js', file);
