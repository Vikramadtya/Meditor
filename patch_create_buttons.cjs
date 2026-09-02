const fs = require('fs');

function patchFile(path) {
  let file = fs.readFileSync(path, 'utf8');
  
  // Add FilePlus, FolderPlus imports
  if (!file.includes('FilePlus')) {
    file = file.replace('Plus,', 'Plus, FilePlus, FolderPlus,');
  }

  // Replace the single Plus button block with two buttons
  const singlePlusRegex = /<div\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+openCreateVaultItemModal\("container", [^)]+\);\s+\}\}\s+style=\{\{\s+display: "flex",\s+alignItems: "center",\s+\}\}\s+>\s+<Plus size=\{14\} \/>\s+<\/div>/g;
  
  file = file.replace(singlePlusRegex, (match, offset, string) => {
    const parentPathMatch = match.match(/openCreateVaultItemModal\("container", ([^)]+)\)/);
    const parentPath = parentPathMatch ? parentPathMatch[1] : 'null';
    return `
          <div
            onClick={(e) => {
              e.stopPropagation();
              openCreateVaultItemModal("note", ${parentPath});
            }}
            title="New Note"
            style={{ display: "flex", alignItems: "center", marginRight: "4px" }}
          >
            <FilePlus size={14} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              openCreateVaultItemModal("container", ${parentPath});
            }}
            title="New Folder"
            style={{ display: "flex", alignItems: "center" }}
          >
            <FolderPlus size={14} />
          </div>`;
  });
  fs.writeFileSync(path, file);
}

patchFile('src/components/vault/sidebar/VaultNode.jsx');
patchFile('src/components/vault/sidebar/VaultGroupNode.jsx');
