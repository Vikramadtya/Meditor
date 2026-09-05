const fs = require('fs');
let code = fs.readFileSync('src/domains/vault/application/VaultMutationUseCase.js', 'utf8');

// Fix moveFile to move
code = code.replace(/window\.Neutralino\.filesystem\.moveFile/g, 'window.Neutralino.filesystem.move');

// Add audit logs
code = code.replace(
  /vaultRepository\.upsertContainer\({([\s\S]*?)}\);/,
  `vaultRepository.upsertContainer({$1});\n  vaultRepository.logAuditAction("CREATE_COLLECTION", \`Created collection "\${name}"\`);`
);

code = code.replace(
  /vaultRepository\.upsertNote\({([\s\S]*?)}\);/,
  `vaultRepository.upsertNote({$1});\n  vaultRepository.logAuditAction("CREATE_NOTE", \`Created note "\${name}"\`);`
);

code = code.replace(
  /vaultRepository\.deleteNoteById\(id\);/,
  `vaultRepository.deleteNoteById(id);\n      vaultRepository.logAuditAction("DELETE_NOTE", \`Deleted note at \${relPath}\`);`
);

code = code.replace(
  /vaultRepository\._run\("UPDATE notes SET is_deleted=1 WHERE id=\?", \[id\]\);/,
  `vaultRepository._run("UPDATE notes SET is_deleted=1 WHERE id=?", [id]);\n      vaultRepository.logAuditAction("SOFT_DELETE_NOTE", \`Soft deleted note \${id}\`);`
);

code = code.replace(
  /vaultRepository\.deleteContainerById\(id\);/,
  `vaultRepository.deleteContainerById(id);\n      vaultRepository.logAuditAction("DELETE_COLLECTION", \`Deleted collection at \${relPath}\`);`
);

code = code.replace(
  /vaultRepository\._run\("UPDATE notes SET name=\?, path=\? WHERE id=\?", \[\n      nameWithoutExt,\n      newRel,\n      id,\n    \]\);/,
  `vaultRepository._run("UPDATE notes SET name=?, path=? WHERE id=?", [
      nameWithoutExt,
      newRel,
      id,
    ]);
    vaultRepository.logAuditAction("RENAME_NOTE", \`Renamed note to "\${newName}"\`);`
);

code = code.replace(
  /vaultRepository\._run\("UPDATE containers SET name=\?, path=\? WHERE id=\?", \[\n      newName,\n      newRel,\n      id,\n    \]\);/,
  `vaultRepository._run("UPDATE containers SET name=?, path=? WHERE id=?", [
      newName,
      newRel,
      id,
    ]);
    vaultRepository.logAuditAction("RENAME_COLLECTION", \`Renamed collection to "\${newName}"\`);`
);

// Add moveItemCommand
const moveCode = `
export async function moveItemCommand(vaultPath, type, id, oldRelPath, newParentRelPath) {
  if (!oldRelPath) throw new Error("oldRelPath is required");
  const oldFull = \`\${vaultPath}/\${oldRelPath}\`;
  
  const fileName = oldRelPath.split("/").pop();
  const newRel = newParentRelPath === "notes" ? fileName : \`\${newParentRelPath}/\${fileName}\`;
  const newFull = \`\${vaultPath}/\${newRel}\`;

  await window.Neutralino.filesystem.move(oldFull, newFull);

  if (type === "note") {
    vaultRepository._run("UPDATE notes SET path=? WHERE id=?", [newRel, id]);
    vaultRepository.logAuditAction("MOVE_NOTE", \`Moved note "\${fileName}" to \${newParentRelPath}\`);
  } else {
    vaultRepository._run("UPDATE containers SET path=? WHERE id=?", [newRel, id]);
    vaultRepository.logAuditAction("MOVE_COLLECTION", \`Moved collection "\${fileName}" to \${newParentRelPath}\`);
  }
}
`;

fs.writeFileSync('src/domains/vault/application/VaultMutationUseCase.js', code + moveCode);
