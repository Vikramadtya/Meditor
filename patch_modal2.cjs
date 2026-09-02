const fs = require('fs');

let file = fs.readFileSync('src/components/modals/CreateVaultItemModal.jsx', 'utf8');

file = file.replace(
  '      if (parentId) {\n        vaultService.getFolderContents(parentId).then((children) => {\n          const hasNotes = children.some((c) => c.type === "note");\n          const hasContainers = children.some((c) => c.type === "container");\n          if (hasNotes && !hasContainers) {\n            setAllowedTypes(["note"]);\n            setSelectedType("note");\n          } else if (hasContainers && !hasNotes) {\n            setAllowedTypes(["container"]);\n            setSelectedType("container");\n          }\n        });\n      }',
  `      if (parentId && !isGroup) {
        vaultService.getFolderContents(parentId).then((children) => {
          const hasNotes = children.some((c) => c.type === "note");
          const hasContainers = children.some((c) => c.type === "container");
          if (hasNotes && !hasContainers) {
            setAllowedTypes(["note"]);
            setSelectedType("note");
          } else if (hasContainers && !hasNotes) {
            setAllowedTypes(["container"]);
            setSelectedType("container");
          }
        });
      }`
);

fs.writeFileSync('src/components/modals/CreateVaultItemModal.jsx', file);
