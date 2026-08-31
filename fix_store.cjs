const fs = require('fs');

let wsCode = fs.readFileSync('src/application/workspace/WorkspaceService.js', 'utf8');
wsCode = wsCode.replace('const hierarchy = vaultService.getHierarchy();', 'const hierarchy = await vaultService.getFolderContents("notes");');
fs.writeFileSync('src/application/workspace/WorkspaceService.js', wsCode);

let idxCode = fs.readFileSync('src/store/index.js', 'utf8');
idxCode = idxCode.replace('s.vaultHierarchy = vaultService.getHierarchy();', 'vaultService.getFolderContents("notes").then(h => useStore.getState().setVaultHierarchy(h));');
idxCode = idxCode.replace('reloadVaultHierarchy: () =>', 'reloadVaultHierarchy: async () =>');
idxCode = idxCode.replace('set((s) => {\n            s.vaultHierarchy = vaultService.getHierarchy();\n          });', 'const h = await vaultService.getFolderContents("notes");\n          set((s) => { s.vaultHierarchy = h; });');
fs.writeFileSync('src/store/index.js', idxCode);
console.log('Fixed Store');
