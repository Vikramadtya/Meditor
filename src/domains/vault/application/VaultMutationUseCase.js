import { fileSystem } from "../../workspace/infrastructure/NeutralinoFileSystem";
import { vaultRepository } from "../infrastructure/SqliteVaultRepository";

export async function createContainerCommand(vaultPath, parentRelPath, name) {
  const newRel = `${parentRelPath}/${name}`;
  const full = `${vaultPath}/${newRel}`;
  await window.Neutralino.filesystem.createDirectory(full);

  const id = crypto.randomUUID();
  const meta = { id, type: "container", children_order: [] };
  await fileSystem.writeFile(
    `${full}/.metadata`,
    JSON.stringify(meta, null, 2),
  );

  vaultRepository.upsertContainer({
    id,
    path: newRel,
    name,
    metadata: meta,
  });
  return meta;
}

export async function createNoteCommand(vaultPath, parentRelPath, name) {
  const id = crypto.randomUUID();
  const newRel = `${parentRelPath}/${name}.md`;
  const full = `${vaultPath}/${newRel}`;

  const fm = `---\nid: ${id}\ntags:\n---\n\n# ${name}\n`;
  await fileSystem.writeFile(full, fm);

  vaultRepository.upsertNote({
    id,
    path: newRel,
    name,
    tags: "",
    updated_at: Date.now(),
  });
  return { id, name, path: newRel, type: "note" };
}

export async function deleteItemCommand(
  vaultPath,
  type,
  id,
  relPath,
  hard = false,
) {
  if (type === "note") {
    if (hard && relPath) {
      const full = `${vaultPath}/${relPath}`;
      await fileSystem.removeFile(full);
      vaultRepository.deleteNoteById(id);
    } else {
      // Soft delete
      vaultRepository._run("UPDATE notes SET is_deleted=1 WHERE id=?", [id]);
    }
  } else {
    // Containers are always hard deleted
    if (relPath) {
      const full = `${vaultPath}/${relPath}`;
      await fileSystem.removeDirectory(full);
      vaultRepository.deleteContainerById(id);
    }
  }
}

export async function renameItemCommand(
  vaultPath,
  type,
  id,
  oldRelPath,
  newName,
) {
  if (!oldRelPath) throw new Error("oldRelPath is required");
  const oldFull = `${vaultPath}/${oldRelPath}`;

  const parentRel = oldRelPath.substring(0, oldRelPath.lastIndexOf("/"));
  let newRel = parentRel ? `${parentRel}/${newName}` : newName;
  if (type === "note" && !newRel.endsWith(".md")) {
    newRel += ".md";
  }

  const newFull = `${vaultPath}/${newRel}`;

  await window.Neutralino.filesystem.moveFile(oldFull, newFull);

  if (type === "note") {
    // If we rename a note, we just update the 'name' and 'path' in SQLite
    const nameWithoutExt = newName.replace(/\.md$/, "");
    vaultRepository._run("UPDATE notes SET name=?, path=? WHERE id=?", [
      nameWithoutExt,
      newRel,
      id,
    ]);
  } else {
    // If we rename a container, we update its name and path
    vaultRepository._run("UPDATE containers SET name=?, path=? WHERE id=?", [
      newName,
      newRel,
      id,
    ]);
    // WARNING: SQLite does not easily cascade paths for nested items in a tree unless we query them.
    // However, since we read the filesystem for hierarchy, the next refresh will fix the paths.
    // BUT we should update nested paths in SQLite too!
    // Since we don't have a simple cascading update, we will just syncVault to clean up DB state!
  }
}
