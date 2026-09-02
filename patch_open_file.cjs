const fs = require('fs');

let file = fs.readFileSync('src/store/actions/editorActions.js', 'utf8');
file = file.replace(
  '      if (vaultItem) existing.vaultItem = vaultItem;',
  '      if (vaultItem) { useStore.setState((s) => { const t = s.tabs.find(x => x.id === existing.id); if (t) t.vaultItem = vaultItem; }); }'
);
fs.writeFileSync('src/store/actions/editorActions.js', file);
