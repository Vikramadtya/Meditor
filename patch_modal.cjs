const fs = require('fs');

let file = fs.readFileSync('src/components/modals/CreateVaultItemModal.jsx', 'utf8');

file = file.replace(
  '      setSelectedType(type === "auto" || !type ? "note" : type);\n      setAllowedTypes(["note", "container"]);',
  `      // If parentId has no slash, it's a root group. Root groups can ONLY hold collections.
      const isGroup = parentId && !parentId.includes('/');
      
      if (isGroup) {
        setSelectedType("container");
        setAllowedTypes(["container"]);
      } else {
        setSelectedType(type === "auto" || !type ? "note" : (type === "container" ? "note" : type)); 
        // We default to note if they didn't explicitly restrict, but wait, type === "container" shouldn't lock it if it was passed accidentally.
        // Actually, let's always default to Note if allowed both, but if type is explicitly set to something else, we use it.
        // In VaultNode.jsx, we will pass "auto".
        setSelectedType(type === "auto" || !type ? "note" : type);
        setAllowedTypes(["note", "container"]);
      }`
);

fs.writeFileSync('src/components/modals/CreateVaultItemModal.jsx', file);
