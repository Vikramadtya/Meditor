const fs = require('fs');

let file = fs.readFileSync('src/hooks/useDragAndDrop.js', 'utf8');

file = file.replace(
  /function resolveVaultImagePaths[\s\S]*?async function ensureDir/,
  `function resolveVaultImagePaths(activeVaultItem, currentFolder) {
  if (!activeVaultItem || !activeVaultItem.path) return null;
  
  const pathParts = activeVaultItem.path.split('/');
  // Remove the note name itself to get the directory segment
  pathParts.pop();
  const pathSegment = pathParts.join('/');
  
  return {
    destFolder: \`\${currentFolder}/assets/images/\${pathSegment}\`,
    markdownPath: \`/assets/images/\${pathSegment}\`,
  };
}

async function ensureDir`
);

file = file.replace(
  /const paths = resolveVaultImagePaths\(noteId, folder\);/,
  'const paths = resolveVaultImagePaths(activeVaultItem, folder);'
);

file = file.replace(
  /vaultRepository\.insertImage\(imageId, noteId, fileName, Date\.now\(\)\);/,
  '// No longer needed, image is just placed on disk'
);

fs.writeFileSync('src/hooks/useDragAndDrop.js', file);
