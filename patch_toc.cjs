const fs = require('fs');

let hook = fs.readFileSync('src/hooks/useTableOfContents.js', 'utf8');
hook = hook.replace(
  /workspaceMode,\n  };\n}/,
  'workspaceMode,\n    activeVaultItem,\n  };\n}'
);
fs.writeFileSync('src/hooks/useTableOfContents.js', hook);

let comp = fs.readFileSync('src/components/editor/TableOfContents.jsx', 'utf8');
comp = comp.replace(
  /workspaceMode,\n  } = useTableOfContents\(\);/,
  'workspaceMode,\n    activeVaultItem,\n  } = useTableOfContents();'
);
fs.writeFileSync('src/components/editor/TableOfContents.jsx', comp);
