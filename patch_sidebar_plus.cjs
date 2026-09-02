const fs = require('fs');

function patchFile(path) {
  let file = fs.readFileSync(path, 'utf8');

  // Find the block with FilePlus and FolderPlus and replace it with a single Plus button
  // that uses "auto" for the type
  const regex = /<div\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+openCreateVaultItemModal\("note", ([^)]+)\);\s+\}\}\s+title="New Note"[^>]*>\s+<FilePlus size=\{14\} \/>\s+<\/div>\s+<div\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+openCreateVaultItemModal\("container", \1\);\s+\}\}\s+title="New Folder"[^>]*>\s+<FolderPlus size=\{14\} \/>\s+<\/div>/g;
  
  file = file.replace(regex, (match, parentPath) => {
    return `
          <div
            onClick={(e) => {
              e.stopPropagation();
              openCreateVaultItemModal("auto", ${parentPath});
            }}
            title="Create Item"
            style={{ display: "flex", alignItems: "center" }}
          >
            <Plus size={14} />
          </div>`;
  });
  
  fs.writeFileSync(path, file);
}

patchFile('src/components/vault/sidebar/VaultNode.jsx');
patchFile('src/components/vault/sidebar/VaultGroupNode.jsx');
